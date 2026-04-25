"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/pkg-dir";
exports.ids = ["vendor-chunks/pkg-dir"];
exports.modules = {

/***/ "(rsc)/./node_modules/pkg-dir/index.js":
/*!***************************************!*\
  !*** ./node_modules/pkg-dir/index.js ***!
  \***************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("\nconst path = __webpack_require__(/*! path */ \"path\");\nconst findUp = __webpack_require__(/*! find-up */ \"(rsc)/./node_modules/find-up/index.js\");\n\nconst pkgDir = async cwd => {\n\tconst filePath = await findUp('package.json', {cwd});\n\treturn filePath && path.dirname(filePath);\n};\n\nmodule.exports = pkgDir;\n// TODO: Remove this for the next major release\nmodule.exports[\"default\"] = pkgDir;\n\nmodule.exports.sync = cwd => {\n\tconst filePath = findUp.sync('package.json', {cwd});\n\treturn filePath && path.dirname(filePath);\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvcGtnLWRpci9pbmRleC5qcyIsIm1hcHBpbmdzIjoiQUFBYTtBQUNiLGFBQWEsbUJBQU8sQ0FBQyxrQkFBTTtBQUMzQixlQUFlLG1CQUFPLENBQUMsc0RBQVM7O0FBRWhDO0FBQ0EsZ0RBQWdELElBQUk7QUFDcEQ7QUFDQTs7QUFFQTtBQUNBO0FBQ0EseUJBQXNCOztBQUV0QixtQkFBbUI7QUFDbkIsK0NBQStDLElBQUk7QUFDbkQ7QUFDQSIsInNvdXJjZXMiOlsiL2hvbWUvYWJkby9teS1tYXJrZXRwbGFjZS9ub2RlX21vZHVsZXMvcGtnLWRpci9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5jb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuY29uc3QgZmluZFVwID0gcmVxdWlyZSgnZmluZC11cCcpO1xuXG5jb25zdCBwa2dEaXIgPSBhc3luYyBjd2QgPT4ge1xuXHRjb25zdCBmaWxlUGF0aCA9IGF3YWl0IGZpbmRVcCgncGFja2FnZS5qc29uJywge2N3ZH0pO1xuXHRyZXR1cm4gZmlsZVBhdGggJiYgcGF0aC5kaXJuYW1lKGZpbGVQYXRoKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gcGtnRGlyO1xuLy8gVE9ETzogUmVtb3ZlIHRoaXMgZm9yIHRoZSBuZXh0IG1ham9yIHJlbGVhc2Vcbm1vZHVsZS5leHBvcnRzLmRlZmF1bHQgPSBwa2dEaXI7XG5cbm1vZHVsZS5leHBvcnRzLnN5bmMgPSBjd2QgPT4ge1xuXHRjb25zdCBmaWxlUGF0aCA9IGZpbmRVcC5zeW5jKCdwYWNrYWdlLmpzb24nLCB7Y3dkfSk7XG5cdHJldHVybiBmaWxlUGF0aCAmJiBwYXRoLmRpcm5hbWUoZmlsZVBhdGgpO1xufTtcbiJdLCJuYW1lcyI6W10sImlnbm9yZUxpc3QiOlswXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/pkg-dir/index.js\n");

/***/ })

};
;