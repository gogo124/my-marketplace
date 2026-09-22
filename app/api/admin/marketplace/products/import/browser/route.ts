import { NextResponse } from "next/server";
import { getAdminApiSession } from "@/lib/admin";
import { connectToDatabase } from "@/lib/db";
import ResellingProduct from "@/models/ResellingProduct";
import { importBrowserProduct, previewBrowserProduct, validateSupplierUrl } from "@/lib/marketplace-importer";

const MAX_BODY_BYTES=160_000;

function normalizedName(name:string){
  return name.replace(/\s+/g," ").trim().toLowerCase();
}

function isNonSelectableOptionName(name:string){
  const value=normalizedName(name);
  return /^(sku|product\s*sku|seller\s*sku|supplier\s*sku|reference|référence|product\s*id|productid|item\s*id|itemid|ean|ean13|ean-13|gtin|gtin13|gtin-13|upc|mpn|model|modèle|model\s*number|numéro\s*de\s*modèle|brand|marque|weight|poids|poids\s*\(.*\)|dimensions?|dimension|length|longueur|width|largeur|height|hauteur|depth|profondeur|shipping\s*weight|package\s*weight|packaging|condition|warranty|garantie|product\s*code|code\s*produit)$/i.test(value);
}

function isSizeValue(value:string){
  const v=value.replace(/\s+/g," ").trim().toUpperCase();
  return /^(XXXS|XXS|XS|S|M|L|XL|XXL|XXXL|XXXXL|2XL|3XL|4XL|5XL|6XL|7XL|8XL|9XL|10XL|US\s*(?:XS|S|M|L|XL|XXL|XXXL)|EU\s*\d{2}|\d{1,2}(?:\/\d{1,2})?)$/.test(v);
}

function canonicalOptionName(name:string,values:unknown[]=[]){
  const value=normalizedName(name);
  if(/^(options?\s+disponibles|available\s+options|options?|variantes?|variant\s+options?)$/i.test(value)){
    const cleaned=values.map(v=>String(v||"").trim()).filter(Boolean);
    if(cleaned.length>=2&&cleaned.every(isSizeValue))return "Size";
    return "Option";
  }
  if(/^(color|colour|couleur|couleurs|لون)$/i.test(value))return "Color";
  if(/^(size|taille|tailles|pointure|المقاس|الحجم)$/i.test(value))return "Size";
  return name.replace(/\s+/g," ").trim();
}

function sanitizeBrowserProduct(input:any){
  const product={...input};
  const rawGroups=product.optionGroups&&typeof product.optionGroups==="object"?product.optionGroups:{};
  const optionGroups:Record<string,string[]>={};
  for(const [rawName,rawValues] of Object.entries(rawGroups)){
    if(isNonSelectableOptionName(String(rawName))||!Array.isArray(rawValues))continue;
    const values=[...new Set(rawValues.map(v=>String(v||"").replace(/\s+/g," ").trim()).filter(Boolean))];
    if(!values.length)continue;
    const name=canonicalOptionName(String(rawName),values);
    if(isNonSelectableOptionName(name))continue;
    const existing=optionGroups[name]??(optionGroups[name]=[]);
    values.forEach(value=>{if(!existing.some(v=>v.toLowerCase()===value.toLowerCase()))existing.push(value)});
  }
  product.optionGroups=optionGroups;

  const selectableGroupNames=new Set(Object.keys(optionGroups).map(normalizedName));
  if(Array.isArray(product.variants)){
    const seen=new Set<string>();
    product.variants=product.variants.map((variant:any)=>{
      const options=variant?.options&&typeof variant.options==="object"?Object.fromEntries(
        Object.entries(variant.options).filter(([name])=>!isNonSelectableOptionName(String(name)))
      ):{};
      const normalizedOptions:Record<string,string>={};
      for(const [rawName,rawValue] of Object.entries(options)){
        const name=canonicalOptionName(String(rawName));
        const value=String(rawValue||"").replace(/\s+/g," ").trim();
        if(!name||!value||isNonSelectableOptionName(name))continue;
        if(selectableGroupNames.size>0&&!selectableGroupNames.has(normalizedName(name))){
          const matchingGroup=Object.keys(optionGroups).find(group=>normalizedName(group)===normalizedName(name));
          if(!matchingGroup)continue;
        }
        normalizedOptions[name]=value;
      }
      if(!Object.keys(normalizedOptions).length)return null;
      const normalized={...variant,options:normalizedOptions};
      const key=JSON.stringify(normalizedOptions)+"|"+String(variant?.sku||variant?.sourceVariantId||"");
      if(seen.has(key))return null;
      seen.add(key);
      return normalized;
    }).filter(Boolean);
  }

  if(!Array.isArray(product.variants)||!product.variants.length){
    const groups=Object.entries(optionGroups);
    const meaningful=groups.filter(([,values])=>values.length>0);
    if(meaningful.length){
      const [firstName,firstValues]=meaningful[0];
      product.variants=firstValues.slice(0,300).map(value=>({
        options:{[firstName]:value},
        price:product.sourcePrice??null,
        stockStatus:product.stockStatus||"unknown",
        stockQuantity:product.stockQuantity??null,
        sku:product.sku||null,
        sourceVariantId:`browser:${firstName}:${value}`
      }));
    }
  }

  if(Array.isArray(product.variants)&&product.variants.length&&Object.keys(optionGroups).length===1){
    const [groupName,groupValues]=Object.entries(optionGroups)[0];
    const variantOptions=product.variants.flatMap((v:any)=>Object.keys(v.options||{}));
    const hasGroup=variantOptions.some((name:string)=>normalizedName(name)===normalizedName(groupName));
    if(!hasGroup&&groupValues.length>0){
      const template=product.variants[0];
      product.variants=groupValues.slice(0,300).map(value=>({
        ...template,
        options:{[groupName]:value},
        price:template.price??product.sourcePrice??null,
        sourceVariantId:`browser:${groupName}:${value}`
      }));
    }
  }
  return product;
}

export async function POST(request:Request){
  const admin=await getAdminApiSession();
  if("error" in admin)return admin.error;
  const length=Number(request.headers.get("content-length")||0);
  if(Number.isFinite(length)&&length>MAX_BODY_BYTES)return NextResponse.json({error:"Browser import payload is too large."},{status:413});
  try{
    const body=await request.json();
    if(String(body?.supplier||"").toLowerCase()!=="jumia")return NextResponse.json({error:"This browser importer only supports Jumia."},{status:400});
    const sourceUrl=validateSupplierUrl(String(body?.sourceUrl||""));
    const rawProduct=body?.product;
    if(!rawProduct||typeof rawProduct!=="object")return NextResponse.json({error:"Browser product data is required."},{status:400});
    if(JSON.stringify(rawProduct).length>MAX_BODY_BYTES)return NextResponse.json({error:"Browser import payload is too large."},{status:413});
    const product=sanitizeBrowserProduct(rawProduct);
    if(!Array.isArray(product.variants)||!product.variants.length)return NextResponse.json({error:"No customer-selectable product options were detected from the browser extraction."},{status:422});

    if(body?.action==="preview"){
      const result=await previewBrowserProduct(product,sourceUrl);
      return NextResponse.json(result,{status:result.duplicate?409:200});
    }

    await connectToDatabase();
    const preview=await previewBrowserProduct(product,sourceUrl);
    if(preview.duplicate&&preview.existing?._id){
      const next=preview.product;
      const storedVariants=Array.isArray(next.variants)?next.variants:[];
      if(!storedVariants.length)return NextResponse.json({error:"The browser importer did not find real variant combinations. Existing product was not changed."},{status:422});
      const existing=await ResellingProduct.findById(preview.existing._id);
      if(!existing)return NextResponse.json({error:"The existing product could not be found."},{status:404});
      const manualOverrides=new Set(existing.sourceSync?.manualOverrides||[]);
      const set:any={
        "sourceSync.variants":storedVariants,
        "sourceSync.sourcePrice":next.sourcePrice,
        "sourceSync.originalPrice":next.originalPrice,
        "sourceSync.currency":next.currency,
        "sourceSync.stockStatus":next.stockStatus,
        "sourceSync.stockQuantity":next.stockQuantity,
        "sourceSync.sourceUrl":next.sourceUrl,
        "sourceSync.canonicalUrl":next.canonicalUrl,
        "sourceSync.sourceProductId":next.sourceProductId,
        "sourceSync.sourceHash":next.sourceHash,
        "sourceSync.lastSyncAttemptAt":new Date(),
        "sourceSync.lastSuccessfulSyncAt":new Date(),
        "sourceSync.lastSyncStatus":"synced",
        "sourceSync.lastSyncError":"",
      };
      if(!manualOverrides.has("variants"))set.variants=storedVariants;
      if(!manualOverrides.has("sellingPrice")&&next.sourcePrice!=null){
        const margin=Number(existing.sourceSync?.marginPercent??existing.marginValue??30);
        if(existing.sourceSync?.pricingMode!=="manual")set.sellingPrice=Math.max(0,Math.round(Number(next.sourcePrice)*(1+margin/100)*100)/100);
      }
      await ResellingProduct.updateOne({_id:existing._id},{$set:set});
      return NextResponse.json({duplicate:false,refreshed:true,existing,product:next},{status:200});
    }

    const result=await importBrowserProduct(product,sourceUrl);
    return NextResponse.json(result,{status:result.duplicate?409:201});
  }catch(error){
    const message=error instanceof Error?error.message:"Could not import the browser-collected product.";
    return NextResponse.json({error:message},{status:400});
  }
}
