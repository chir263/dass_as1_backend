let str = "vyom ke bhosDa mei Kabir ka lunD";

let banned_keywords = ["mc", "lund", "lawda", "nigga", "bhosda"];
String.prototype.replaceAll = function (strReplace, strWith) {
  var esc = strReplace.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
  var reg = new RegExp(esc, "ig");
  return this.replace(reg, strWith);
};
for (const word of banned_keywords) {
  if (str.search(new RegExp("Ral", "i")) == -1) {
    str = str.replaceAll(word, "*");
  }
}

// console.log(str);
