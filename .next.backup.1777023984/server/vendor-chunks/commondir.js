/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/commondir";
exports.ids = ["vendor-chunks/commondir"];
exports.modules = {

/***/ "(rsc)/./node_modules/commondir/index.js":
/*!*****************************************!*\
  !*** ./node_modules/commondir/index.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("var path = __webpack_require__(/*! path */ \"path\");\n\nmodule.exports = function (basedir, relfiles) {\n    if (relfiles) {\n        var files = relfiles.map(function (r) {\n            return path.resolve(basedir, r);\n        });\n    }\n    else {\n        var files = basedir;\n    }\n    \n    var res = files.slice(1).reduce(function (ps, file) {\n        if (!file.match(/^([A-Za-z]:)?\\/|\\\\/)) {\n            throw new Error('relative path without a basedir');\n        }\n        \n        var xs = file.split(/\\/+|\\\\+/);\n        for (\n            var i = 0;\n            ps[i] === xs[i] && i < Math.min(ps.length, xs.length);\n            i++\n        );\n        return ps.slice(0, i);\n    }, files[0].split(/\\/+|\\\\+/));\n    \n    // Windows correctly handles paths with forward-slashes\n    return res.length > 1 ? res.join('/') : '/'\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvY29tbW9uZGlyL2luZGV4LmpzIiwibWFwcGluZ3MiOiJBQUFBLFdBQVcsbUJBQU8sQ0FBQyxrQkFBTTs7QUFFekI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXMiOlsiL2hvbWUvYWJkby9teS1tYXJrZXRwbGFjZS9ub2RlX21vZHVsZXMvY29tbW9uZGlyL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbInZhciBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChiYXNlZGlyLCByZWxmaWxlcykge1xuICAgIGlmIChyZWxmaWxlcykge1xuICAgICAgICB2YXIgZmlsZXMgPSByZWxmaWxlcy5tYXAoZnVuY3Rpb24gKHIpIHtcbiAgICAgICAgICAgIHJldHVybiBwYXRoLnJlc29sdmUoYmFzZWRpciwgcik7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgdmFyIGZpbGVzID0gYmFzZWRpcjtcbiAgICB9XG4gICAgXG4gICAgdmFyIHJlcyA9IGZpbGVzLnNsaWNlKDEpLnJlZHVjZShmdW5jdGlvbiAocHMsIGZpbGUpIHtcbiAgICAgICAgaWYgKCFmaWxlLm1hdGNoKC9eKFtBLVphLXpdOik/XFwvfFxcXFwvKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdyZWxhdGl2ZSBwYXRoIHdpdGhvdXQgYSBiYXNlZGlyJyk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHZhciB4cyA9IGZpbGUuc3BsaXQoL1xcLyt8XFxcXCsvKTtcbiAgICAgICAgZm9yIChcbiAgICAgICAgICAgIHZhciBpID0gMDtcbiAgICAgICAgICAgIHBzW2ldID09PSB4c1tpXSAmJiBpIDwgTWF0aC5taW4ocHMubGVuZ3RoLCB4cy5sZW5ndGgpO1xuICAgICAgICAgICAgaSsrXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybiBwcy5zbGljZSgwLCBpKTtcbiAgICB9LCBmaWxlc1swXS5zcGxpdCgvXFwvK3xcXFxcKy8pKTtcbiAgICBcbiAgICAvLyBXaW5kb3dzIGNvcnJlY3RseSBoYW5kbGVzIHBhdGhzIHdpdGggZm9yd2FyZC1zbGFzaGVzXG4gICAgcmV0dXJuIHJlcy5sZW5ndGggPiAxID8gcmVzLmpvaW4oJy8nKSA6ICcvJ1xufTtcbiJdLCJuYW1lcyI6W10sImlnbm9yZUxpc3QiOlswXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/commondir/index.js\n");

/***/ })

};
;