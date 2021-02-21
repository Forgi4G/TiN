//export const stripES: any = String.prototype.replace(/\s+/g, ' ').trim;
module.exports = {
    stripES: String.prototype.replace(/\s+/g, ' ').trim
}