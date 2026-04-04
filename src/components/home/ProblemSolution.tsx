import { XCircle, CheckCircle2 } from 'lucide-react'

export default function ProblemSolution() {
  return (
    <section className="py-14 sm:py-20 bg-brand-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="section-subtitle text-red-400">Le problème</p>
            <h2 className="text-3xl font-black text-brand-cream mb-6">
              Votre moteur mérite mieux
            </h2>
            <ul className="space-y-4">
              {[
                'Huiles de mauvaise qualité disponibles sur le marché local',
                'Moteurs qui surchauffent dans les conditions tropicales',
                'Manque de transparence sur la composition des produits',
                "Absence de garantie d'authenticité et de certification",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <span className="text-zinc-400 text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-gradient-to-br from-brand-gold/10 to-transparent border border-brand-gold/20 rounded-2xl p-8">
            <p className="section-subtitle">La solution</p>
            <h2 className="text-3xl font-black text-brand-cream mb-6">
              Super M7 par Master Oil
            </h2>
            <ul className="space-y-4">
              {[
                "Importée directement du Canada, 100% authentique et certifiée",
                'Formule synthétique spéciale pour les hautes températures tropicales',
                'Disponibilité permanente avec stock local à Conakry',
                'Service professionnel avec suivi et conseils techniques',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-brand-gold mt-0.5 flex-shrink-0" />
                  <span className="text-zinc-300 text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
