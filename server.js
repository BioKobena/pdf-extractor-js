const express = require('express');
const cors = require('cors');
const { PDFParse } = require('pdf-parse');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); 
app.use(express.json({ limit: '50mb' }));

app.get('/', (req, res) => {
  res.json({ 
    message: 'API d\'extraction PDF active',
    version: '1.0.0',
    endpoints: {
      health: 'GET /',
      extractPdf: 'POST /extract-pdf'
    }
  });
});

app.post('/extract-pdf', async (req, res) => {
  try {
    const { file, filename } = req.body;

    if (!file) {
      return res.status(400).json({ 
        error: 'Le fichier est requis',
        message: 'Veuillez envoyer un fichier en base64'
      });
    }

    console.log('Extraction en cours pour:', filename || 'fichier.pdf');
    console.log('Taille base64:', file.length, 'caractères');

    const buffer = Buffer.from(file, 'base64');
    console.log('Taille du buffer:', buffer.length, 'octets');

    const uint8Array = new Uint8Array(buffer);
    
    const parser = new PDFParse({ data: uint8Array });
    
    const data = await parser.getText();

    console.log('Extraction réussie!');
    console.log('Nombre de pages:', data.pages);
    console.log('Longueur du texte:', data.text.length, 'caractères');

    res.json({
      success: true,
      filename: filename || 'document.pdf',
      text: data.text,
      metadata: {
        pages: data.pages,
        textLength: data.text.length,
        info: data.info || {},
      }
    });

  } catch (error) {
    console.error(' Erreur lors de l\'extraction:', error.message);
    
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'extraction du PDF',
      message: error.message
    });
  }
});

app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route non trouvée',
    availableRoutes: ['GET /', 'POST /extract-pdf']
  });
});

app.listen(PORT, () => {
  console.log(' Serveur démarré sur le port', PORT);
  console.log('Prêt à extraire des PDFs!');
});

module.exports = app;