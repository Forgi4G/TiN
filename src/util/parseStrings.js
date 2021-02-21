//export const stripES: any = String.prototype.replace(/\s+/g, ' ').trim;
module.exports = {
    stripES: String.prototype.replace(/\s+/g, ' ').trim,
    capitalizeFirstChar: function capitalizeFirstLetter(str) { return str[0].toUpperCase() + str.slice(1); }

}