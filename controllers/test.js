let str = "vyom ke b mei Kabir ka f";

let banned_keywords = ["mc", "lund", "lawda", "nigga", "bhosda"];
String.prototype.replaceAll = function (strReplace, strWith) {
  var esc = strReplace.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
  var reg = new RegExp(esc, "ig");
  return this.replace(reg, strWith);
};
for (const word of banned_keywords) {
  if (str.search(new RegExp("Ral", "i")) == -1) {
    let tem = str.replaceAll(" " + word + " ", "*");
    if (tem !== str) console.log("changing");
  }
}

console.log(str);
