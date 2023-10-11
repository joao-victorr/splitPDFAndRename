const fs = require('fs');
const PDFParser = require('pdf-parse');
const path = require('path');


const date = new Date();

const year = date.getFullYear();
const month = date.getMonth() + 1;
const pathDate = `${month}${year}/`;

const pathDiretory = path.join(__dirname, `../pdf/${pathDate}`);

const renameFile = async (diretory) => {
    fs.readdir(pathDiretory, (err, directory) => {
        if(err) {
            console.error("Erro ao ler pasta", err);
            return;
        }

        for(let i = 0; i < directory.length; i++) {


            const pdfFilePath = pathDiretory + directory[i];

            fs.readFile(pdfFilePath, async (err, data) => {
                if (err) {
                    console.error(err);
                    return;
                }

                const pdf = await PDFParser(data);

                const textLines = pdf.text.split('\n');

                const jsonResult = textLines.map((line, index) => ({
                    lineNumber: index + 1,
                    text: line.trim()
                }));

                
                let searchText = "PERDOMO DOCES LTDA";
                
                let lineNumber = null;
                let newlineNumber = null;
                
                for (let n = 0; n < jsonResult.length; n++) {
                    if (jsonResult[n].text === searchText) {
                        lineNumber = jsonResult[n].lineNumber;
                        newlineNumber = lineNumber + 4;
                        break;
                    } else {
                        console.log("Não encontrado");
                    }
                }

                const newName = pathDiretory + 'CONTRA CHEQUE - ' + jsonResult[newlineNumber - 1].text + '.pdf'
                
                fs.rename(pdfFilePath, newName, (err) => {
                    if(err) {
                        console.error(err);
                        return;
                    }else console.log("Arquivo renomeado");
                })
            });
        }
    })
}

renameFile();