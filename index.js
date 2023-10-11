const fs = require('fs');
const { PDFDocument } = require('pdf-lib');
const PDFParser = require('pdf-parse');
const path = require('path');


const renameFile = async (pathDiretory) => {
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


const splitPDF = async(inputFilePath, outputFolder) => {
  try {
    // Carregar o arquivo PDF
    const pdfBuffer = fs.readFileSync(inputFilePath); // Gera um buffer (arquivo guardado em formato de bytes)
    const pdfDoc = await PDFDocument.load(pdfBuffer); // Carrega um documento PDF apartir de um buffer


    // Iterar sobre cada página e criar um novo PDF para cada uma
    for (let i = 0; i < pdfDoc.getPages().length; i++) {
      const newPdfDoc = await PDFDocument.create();

      const copiedPage = await newPdfDoc.copyPages(pdfDoc, [i]);
      await newPdfDoc.addPage(copiedPage[0]);

      // Salvar o novo PDF com um nome baseado no número da página
      const outputPath = `${outputFolder}/tmp${i}.pdf`;
      const pdfBytes = await newPdfDoc.save();
      fs.writeFileSync(outputPath, pdfBytes);
      console.log(`PDF da página ${i + 1} salvo em: ${outputPath}`);
    
    }

    renameFile('pdf/tmp/');

  } catch (error) {
    console.error('Ocorreu um erro:', error);
  }
}

const inputFilePath = 'pdf/102023/teste.pdf';
const outputFolder = 'pdf/tmp';

splitPDF(inputFilePath, outputFolder);