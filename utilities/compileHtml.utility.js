const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

function compileHtml(html, data){
    const filepath = path.resolve(__dirname,"../emails/", `${html}.html`);
    const source = fs.readFileSync(filepath, "utf8").toString();
    const template = handlebars.compile(source);
    
    return  htmlToSend = template(data);

}


module.exports = { compileHtml }