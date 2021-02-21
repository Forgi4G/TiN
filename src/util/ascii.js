const s_slice = Array.prototype.slice;

function Ascii(name, options) {
    this.options = options ? options : {};
    this.reset(name);
}

let alignment = {
    alignCenter: alignCenter,
    alignRight: alignRight,
    alignAuto: alignAuto,
}

Ascii.LEFT = 0; Ascii.CENTER = 1; Ascii.RIGHT = 2;

function alignLeft(str, len, pad) {
    if (!len || len < 0) {
        return "";
    }
    str = str ? str : '';
    if (!pad) pad = ' ';

    if (typeof str !== 'string') {
        str = str.toString();
    }

    const a_len = len + 1 - str.length;
    if (a_len <= 0) { return str; }
    return str + Array(len + 1 - str.length).join(pad);
}

function alignCenter(str, len, pad) {
    if (!len || len < 0) {
        return "";
    }
    str = str ? str : "";
    pad = pad ? pad : ' ';
    if (typeof str !== 'string') str = str.toString();
    const nLen = str.length, half = Math.floor(len / 2 - nLen / 2), odds = Math.abs((nLen % 2) - (len % 2));
    return alignRight('', half, pad) + str + alignLeft('', half + odds, pad);
}

function alignRight(str, len, pad) {
    if (!len || len < 0) {
        return '';
    }
    str = str ? str : "";
    pad = pad ? pad : ' ';

    if (typeof str !== 'string') str = str.toString();

    const a_len = len + 1 - str.length;
    if (a_len <= 0) return str;
    return Array(len + 1 - str.length).join(pad) + str;
}


function alignAuto(str, len, pad) {
    str = str ? str : "";
    pad = pad ? pad : ' ';
    const type = toString.call(str);
    len = + len;
    if (type !== '[object String]') {
        str = str.toString()
    }
    if (str.length < len) {
        switch(type) {
            case '[object Number]':
                return Ascii.alignRight(str, len, pad);
            default:
                return alignLeft(str, len, pad);
        }
    }
    return str;
}

function arrayFill(len, fill) {
    let arr = new Array(len);
    for (let i = 0; i !== len; i++) {
        arr[i] = fill;
    }
    return arr;
}

Ascii.prototype.reset = function(name) {
    this.__name = ''
    this.__nameAlign = Ascii.CENTER
    this.__rows = []
    this.__maxCells = 0
    this.__aligns = []
    this.__colMaxes = []
    this.__spacing = 1
    this.__heading = null
    this.__headingAlign = Ascii.CENTER
    this.setBorder()

    if (toString.call(name) === '[object String]') {
        this.__name = name
    }
    return this;
}

Ascii.prototype.setBorder = function(edge, fill, top, bottom) {
    this.__border = true;
    if (arguments.length === 1) {
        fill = top = bottom = edge;
    }
    this.__edge = edge || '|';
    this.__fill = fill || '-';
    this.__top = top || '.';
    this.__bottom = bottom || "'";
    return this;
}

Ascii.prototype.setHeading = function(row) {
    if (arguments.length > 1 || toString.call(row) !== '[object Array]') {
        row = s_slice.call(arguments)
    }
    this.__heading = row
    return this
}


Ascii.prototype.addRow = function(row) {
    if (arguments.length > 1 || toString.call(row) !== '[object Array]') {
        row = s_slice.call(arguments)
    }
    this.__maxCells = Math.max(this.__maxCells, row.length)
    this.__rows.push(row)
    return this
}

Ascii.prototype.toString = function() {
    let self = this,
        body = [],
        mLen = this.__maxCells,
        max = arrayFill(mLen, 0),
        total = mLen * 3,
        rows = this.__rows,
        justify,
        border = this.__border,
        all = this.__heading ? [this.__heading].concat(rows) : rows;

    for (let i = 0; i < all.length; i++) {
        let row = all[i];
        for (let k = 0; k < mLen; k++) {
            let cell = row[k];
            max[k] = Math.max(max[k], cell ? cell.toString().length : 0);
        }
    }
    this.__colMaxes = max;

    max.forEach(function(x) {
        total += justify ? justify : x + self.__spacing;
    })
    justify && (total += max.length);
    total -= this.__spacing;

    border && body.push(this.separator(total - mLen + 1, this.__top));
    if (this.__name) {
        border && body.push(this.separator(total - mLen + 1));
    }
    if (this.__heading) {
        body.push(this._renderRow(this.__heading, ' ', this.__headingAlign));
        body.push(this._rowSeparator(mLen, this.__fill));
    }
    for (let i = 0; i < this.__rows.length; i++) {
        body.push(this._renderRow(this.__rows[i], ' '));
    }
    border && body.push(this.separator(total - mLen + 1, this.__bottom));

    let prefix = this.options.prefix || '';
    return prefix + body.join('\n' + prefix);
}

Ascii.prototype.separator = function(len, sep) {
    sep || (sep = this.__edge);
    return sep + alignRight(sep, len, this.__fill);
}

Ascii.prototype._rowSeparator = function() {
    let blanks = arrayFill(this.__maxCells, this.__fill);
    return this._renderRow(blanks, this.__fill);
}

Ascii.prototype._renderRow = function (row, str, align) {
    let tmp = [''], max = this.__colMaxes;

    for (let k = 0; k < this.__maxCells; k++) {
        let cell = row[k], just = max[k], pad = just, cAlign = this.__aligns[k], use = align, method = 'alignAuto';
        use = align ? align : cAlign;

        method = (use === Ascii.LEFT)
            ? "alignLeft" : (use === Ascii.CENTER)
                ? "alignCenter" : (use === Ascii.RIGHT)
                    ? "alignRight" : "alignAuto";

        tmp.push(alignment[method](cell, pad, str));
    }
    let front = tmp.join(str + this.__edge + str);
    front = front.substr(1, front.length);
    return front + str + this.__edge;
};

module.exports = Ascii;
