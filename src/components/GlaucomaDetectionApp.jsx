import { useState } from 'react';
import { Upload, Eye, AlertCircle, CheckCircle, Loader, Info, Menu, X, Home, FileText, Users, HelpCircle, ExternalLink, Mail, Phone } from 'lucide-react';

export default function GlaucomaDetectionApp() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result);
      };
      fileReader.readAsDataURL(file);
      // Reset results when new file is selected
      setResult(null);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("Veuillez sélectionner une image de l'œil");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Création d'un FormData pour envoyer l'image
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Appel de l'API
      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Erreur: ${response.status}`);
      }

      const data = await response.json();
      
      // Traitement de la réponse de l'API Streamlit
      // Supposons que l'API renvoie { prediction: 0.7 } où prediction > 0.5 signifie sain
      const hasGlaucoma = data.prediction_value <= 0.5;

      
      // Calcul de la confiance (en pourcentage)
      // Si prediction est proche de 0 ou 1, la confiance est élevée
      const rawConfidence = hasGlaucoma 
        ? (1 - data.prediction_value) * 2 * 100  // Si glaucome (prediction < 0.5), confiance maximale à 0
        : data.prediction_value * 2 * 100 - 100; // Si sain (prediction > 0.5), confiance maximale à 1
      
      const confidence = Math.min(100, Math.max(70, rawConfidence)).toFixed(2);
      
      // Détermination de la sévérité si glaucome détecté
      let severity = 0;
      if (hasGlaucoma) {
        if (data.prediction_value < 0.2) severity = 3;      // Sévère
        else if (data.prediction_value < 0.35) severity = 2; // Modérée
        else severity = 1;                            // Légère
      }
      
      setResult({
        hasGlaucoma,
        confidence,
        severity,
        rawPrediction: data.prediction
      });
    } catch (err) {
      console.error('Erreur lors de la prédiction:', err);
      setError("Une erreur est survenue lors de l'analyse. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-teal-600 to-blue-700 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Eye className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">OphtalmAI</h1>
                <p className="text-xs text-teal-100">Détection intelligente du glaucome</p>
              </div>
            </div>
            
            {/* Menu pour desktop */}
            <nav className="hidden md:flex space-x-6">
              <a href="#" className="text-white hover:text-teal-200 font-medium flex items-center">
                <Home className="w-4 h-4 mr-1" />
                Accueil
              </a>
              <a href="#" className="text-white hover:text-teal-200 font-medium flex items-center">
                <FileText className="w-4 h-4 mr-1" />
                À propos
              </a>
              <a href="#" className="text-white hover:text-teal-200 font-medium flex items-center">
                <Users className="w-4 h-4 mr-1" />
                Professionnels
              </a>
              <a href="#" className="text-white hover:text-teal-200 font-medium flex items-center">
                <HelpCircle className="w-4 h-4 mr-1" />
                Aide
              </a>
              <a href="#" className="bg-white text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-full font-medium text-sm">
                Connexion
              </a>
            </nav>
            
            {/* Burger menu pour mobile */}
            <div className="md:hidden">
              <button onClick={toggleMenu} className="text-white">
                {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
          
          {/* Menu mobile */}
          {menuOpen && (
            <div className="md:hidden mt-4 pt-4 border-t border-teal-500">
              <nav className="flex flex-col space-y-3">
                <a href="#" className="text-white hover:text-teal-200 py-2 flex items-center">
                  <Home className="w-4 h-4 mr-2" />
                  Accueil
                </a>
                <a href="#" className="text-white hover:text-teal-200 py-2 flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  À propos
                </a>
                <a href="#" className="text-white hover:text-teal-200 py-2 flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Professionnels
                </a>
                <a href="#" className="text-white hover:text-teal-200 py-2 flex items-center">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Aide
                </a>
                <a href="#" className="bg-white text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-full font-medium text-sm inline-flex items-center w-fit">
                  Connexion
                </a>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Banner */}
      <div className="bg-gradient-to-b from-blue-700 to-blue-600 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Détection intelligente du glaucome</h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Utilisez notre technologie IA avancée pour détecter les signes précoces du glaucome à partir d'une simple image du fond d'œil.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Section de téléchargement */}
            <div className="w-full lg:w-1/2">
              <form onSubmit={handleSubmit} className="flex flex-col">
                <div className="border-2 border-dashed border-blue-300 rounded-xl p-8 flex flex-col items-center justify-center bg-blue-50 mb-6 transition-all hover:border-blue-500">
                  <div className="bg-blue-100 p-4 rounded-full mb-4">
                    <Eye className="w-10 h-10 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">Téléchargez une image</h3>
                  <p className="text-gray-600 mb-6 text-center">
                    Pour de meilleurs résultats, utilisez une image claire du fond d'œil
                  </p>
                  <label className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white py-3 px-6 rounded-lg flex items-center cursor-pointer shadow-md transition-all">
                    <Upload className="w-5 h-5 mr-2" />
                    Sélectionner une image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  {selectedFile && (
                    <p className="mt-4 text-sm text-gray-600 font-medium">
                      {selectedFile.name}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!selectedFile || loading}
                  className={`py-3 px-6 rounded-lg font-medium text-lg flex items-center justify-center transition-all ${
                    !selectedFile || loading
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white shadow-md'
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 mr-2 animate-spin" />
                      Analyse en cours...
                    </>
                  ) : (
                    'Analyser l\'image'
                  )}
                </button>

                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-start">
                    <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}
              </form>
            </div>

            {/* Section de prévisualisation et résultats */}
            <div className="w-full lg:w-1/2">
              <div className="h-full flex flex-col">
                <div className="bg-gray-100 rounded-xl p-6 flex flex-col flex-grow">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Aperçu et résultats</h3>
                  
                  {previewUrl ? (
                    <div className="mb-6">
                      <div className="bg-black rounded-lg p-2 flex items-center justify-center">
                        <img
                          src={previewUrl}
                          alt="Aperçu du fond d'œil"
                          className="max-h-64 rounded"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        Image du fond d'œil téléchargée
                      </p>
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center bg-gray-200 rounded-lg mb-6">
                      <p className="text-gray-500">L'aperçu de l'image apparaîtra ici</p>
                    </div>
                  )}

                  {result && (
                    <div className={`p-5 rounded-xl ${
                      result.hasGlaucoma 
                        ? 'bg-red-50 border border-red-200' 
                        : 'bg-green-50 border border-green-200'
                    }`}>
                      <h3 className="font-bold text-lg flex items-center mb-3">
                        {result.hasGlaucoma ? (
                          <>
                            <AlertCircle className="w-6 h-6 mr-2 text-red-600" />
                            <span className="text-red-700">Signes de glaucome détectés</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-6 h-6 mr-2 text-green-600" />
                            <span className="text-green-700">Aucun signe de glaucome détecté</span>
                          </>
                        )}
                      </h3>
                      
                      <div className="mt-4">
                        <div className="flex justify-between mb-1">
                          <p className="text-sm font-medium text-gray-700">Niveau de confiance:</p>
                          <p className="text-sm font-medium">{result.confidence}%</p>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className={`h-2.5 rounded-full ${result.hasGlaucoma ? 'bg-red-600' : 'bg-green-600'}`}
                            style={{ width: `${result.confidence}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      {result.hasGlaucoma && (
                        <div className="mt-4">
                          <div className="flex justify-between mb-1">
                            <p className="text-sm font-medium text-gray-700">Sévérité estimée:</p>
                          </div>
                          <div className="flex space-x-1">
                            {[1, 2, 3].map((level) => (
                              <div 
                                key={level}
                                className={`h-3 flex-1 rounded ${
                                  level <= result.severity 
                                    ? level === 1 ? 'bg-yellow-500' : level === 2 ? 'bg-orange-500' : 'bg-red-600'
                                    : 'bg-gray-300'
                                }`}
                              ></div>
                            ))}
                          </div>
                          <div className="flex justify-between mt-1">
                            <span className="text-xs text-gray-500">Légère</span>
                            <span className="text-xs text-gray-500">Modérée</span>
                            <span className="text-xs text-gray-500">Sévère</span>
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded text-sm text-blue-800 flex items-start">
                        <Info className="w-5 h-5 mr-2 flex-shrink-0 text-blue-600" />
                        <p>
                          Cette analyse est fournie à titre indicatif seulement. 
                          Veuillez consulter un ophtalmologiste pour un diagnostic précis.
                        </p>
                      </div>
                      
                      {result.hasGlaucoma && (
                        <div className="mt-4">
                          <a href="#" className="text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center">
                            Trouver un spécialiste près de chez vous
                            <ExternalLink className="w-4 h-4 ml-1" />
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {!result && !loading && (
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mt-auto">
                      <h4 className="font-medium text-blue-800 flex items-center mb-2">
                        <Info className="w-5 h-5 mr-2 text-blue-600" />
                        Comment ça fonctionne?
                      </h4>
                      <p className="text-sm text-blue-800">
                        Notre algorithme d'intelligence artificielle analyse les caractéristiques 
                        de l'œil pour détecter les signes potentiels du glaucome, comme la 
                        dégénérescence du nerf optique ou l'augmentation de la pression intraoculaire.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Informations supplémentaires */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-teal-50 p-6 rounded-xl border border-teal-100">
              <h3 className="font-semibold text-teal-800 mb-2">Qu'est-ce que le glaucome?</h3>
              <p className="text-sm text-teal-700">
                Le glaucome est une maladie oculaire qui endommage le nerf optique, 
                souvent causée par une pression intraoculaire élevée. Sans traitement, 
                il peut provoquer une perte de vision irréversible.
              </p>
            </div>
            
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
              <h3 className="font-semibold text-blue-800 mb-2">Pourquoi la détection précoce?</h3>
              <p className="text-sm text-blue-700">
                La détection précoce du glaucome est cruciale car les dommages sont irréversibles. 
                Le traitement peut ralentir ou prévenir la progression de la maladie 
                lorsqu'elle est détectée à temps.
              </p>
            </div>
            
            <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
              <h3 className="font-semibold text-purple-800 mb-2">Notre technologie</h3>
              <p className="text-sm text-purple-700">
                Notre système utilise des réseaux neuronaux profonds entraînés sur des milliers 
                d'images oculaires pour identifier les signes subtils du glaucome avec une 
                précision comparable à celle des spécialistes.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Eye className="w-6 h-6 text-teal-400" />
                <h3 className="text-xl font-bold">OphtalmAI</h3>
              </div>
              <p className="text-gray-400 text-sm">
                Technologie de pointe pour la détection précoce des maladies oculaires.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-teal-400">Liens Rapides</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-300 hover:text-white">Accueil</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">À propos</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Professionnels</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Technologie</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Confidentialité</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-teal-400">Ressources</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-300 hover:text-white">Guide du glaucome</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">FAQ</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Études cliniques</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Témoignages</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Blog</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-teal-400">Contact</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-gray-400" />
                  <a href="mailto:contact@ophtalmAI.com" className="text-gray-300 hover:text-white">
                    contact@ophtalmAI.com
                  </a>
                </li>
                <li className="flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-gray-400" />
                  <a href="tel:+33123456789" className="text-gray-300 hover:text-white">
                    +33 1 23 45 67 89
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2025 OphtalmAI. Tous droits réservés.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                Conditions d'utilisation
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                Politique de confidentialité
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                Mentions légales
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}