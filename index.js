const fs = require('fs');
const { PDFDocument } = require('pdf-lib');
const PDFParser = require('pdf-parse');
const path = require('path');


const date = new Date();
const ano = date.getFullYear();
const month = date.getMonth() + 1;
const fileFull = "all.pdf";

console.log(date, ano, month);

const pathDate = "pdf/102023" //`pdf/${month}${ano}`;

console.log(pathDate);


const renameFile = async (pathDiretory) => {

    // if(path)

    fs.readdir(pathDiretory, (err, directory) => {
        if(err) {
            console.error("Erro ao ler pasta", err);
            return;
        }
  
        // console.log("Mostrar Direc: ", directory)
  
        for(let i = 0; i < directory.length; i++) {
  
            if(directory[i] == fileFull) {
                console.log("Arquivo raiz");
            } else {
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
    
                    const searchText = "PERDOMO DOCES LTDA";
                    
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
    
                    const newName = pathDiretory + `CONTRA CHEQUE - ${jsonResult[newlineNumber - 1].text}.pdf`
                    
                    fs.rename(pdfFilePath, newName, (err) => {
                        if(err) {
                            console.error(err);
                            return;
                        }else console.log("Arquivo renomeado");
                    })
                });
            }
        }
    })
}

fs.readdir(pathDate, (err, foldersMonth) => {

    for(let i = 0; i < foldersMonth.length; i++) {

        console.log(foldersMonth.length);
        const inputFolder = `${pathDate}/${foldersMonth[i]}/`;
        console.log(inputFolder)

        fs.readdir(inputFolder, async (err, directory) => {
            if(err) {
                console.error("Erro ao ler pasta: ", err)
            }

            for(let i = 0; i < directory.length; i++) {

                const file = `${inputFolder}${directory[i]}`;

                const pdfBuffer = fs.readFileSync(file); // Gera um buffer (arquivo guardado em formato de bytes)
                const pdfDoc = await PDFDocument.load(pdfBuffer); // Carrega um documento PDF apartir de um buffer
                const pdfPage = pdfDoc.getPages().length;

                if(pdfPage === 1){

                } else {
                    for(let i = 0; i < pdfPage; i++) {
                        const newPdfDoc = await PDFDocument.create();

                        const copiedPage = await newPdfDoc.copyPages(pdfDoc, [i]);
                        await newPdfDoc.addPage(copiedPage[0]);

                        const outputPath = `${inputFolder}/tmp${i}.pdf`;
                        const pdfBytes = await newPdfDoc.save();

                        fs.writeFileSync(outputPath, pdfBytes);
                        console.log("Arquivo salvo");
                    }
                }
            }
            renameFile(inputFolder);
        });

    }

});

