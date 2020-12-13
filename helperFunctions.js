module.exports = {
    truncate: (teksti, pituus) => {
        if (teksti.length > pituus-3) {
            return teksti.slice(0,pituus)+'...'
        } else {
            return teksti
        }
    },
    hintaSuomeksi: hinta => {
        return hinta.toString().replace('.',',');
    },
    errorMessages: errors => {
        messages = {}
        errors.errors.forEach(error => {
            if (messages[error.param]) {
                messages[error.param].push(error.msg);               
            } else {
                messages[error.param] = [error.msg];
            }
        });
        return messages;
    }
}