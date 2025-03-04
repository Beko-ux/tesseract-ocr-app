import React, { useState } from "react";
import Tesseract from "tesseract.js";
import './App.css';  // Assurez-vous que le CSS est bien importé

const App = () => {
  const [image, setImage] = useState(null);
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Gérer la sélection de l'image
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      setText(""); // Réinitialiser le texte affiché
    }
  };

  // Fonction de pré-traitement de l'image
  const preprocessImage = (imageURL) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const img = new Image();
    img.crossOrigin = "Anonymous"; // Éviter les problèmes de CORS
    img.src = imageURL;

    return new Promise((resolve) => {
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;

        // Appliquer un filtre pour améliorer l'image
        ctx.filter = "contrast(200%) brightness(150%)";
        ctx.drawImage(img, 0, 0);

        // Convertir l'image en Data URL (base64) pour la passer à Tesseract
        const processedImage = canvas.toDataURL("image/png");
        resolve(processedImage);
      };
    });
  };

  // Extraire le texte avec Tesseract.js
  const extractText = async () => {
    if (image) {
      setIsLoading(true);
      try {
        // Appliquer le pré-traitement à l'image avant de l'envoyer à Tesseract
        const processedImage = await preprocessImage(image);

        // Extraire le texte avec Tesseract
        const result = await Tesseract.recognize(processedImage, "eng", {
          logger: (m) => console.log(m),
        });
        setText(result.data.text); // Récupérer le texte extrait
      } catch (error) {
        console.error("Erreur lors de l'extraction du texte :", error);
      }
      setIsLoading(false);
    }
  };

  // Télécharger le texte en fichier .txt
  const downloadTextFile = () => {
    const element = document.createElement("a");
    const file = new Blob([text], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "extractedText.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element); // Nettoyage du DOM
  };

  return (
    <div className="App">
      <h1>Extraction de texte avec Tesseract.js</h1>

      {/* Sélection de l'image */}
      <input type="file" accept="image/*" onChange={handleImageChange} />

      {image && (
        <div>
          <img
            src={image}
            alt="Image choisie"
            className="preview-image"
          />
          <br />
          <button onClick={extractText}>Extraire le texte</button>
        </div>
      )}

      {/* Affichage du texte extrait ou du statut de chargement */}
      {isLoading ? (
        <p>Extraction en cours...</p>
      ) : (
        text && (
          <div className="result-section">
            <h2>Texte extrait :</h2>
            <textarea
              value={text}
              readOnly
              rows="10"
              cols="50"
              style={{ whiteSpace: "pre-wrap" }}
            />
            <br />
            <button onClick={downloadTextFile}>
              Télécharger en fichier .txt
            </button>
          </div>
        )
      )}
    </div>
  );
};

export default App;
