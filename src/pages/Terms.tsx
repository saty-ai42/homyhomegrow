import { useI18n } from "@/stores/i18nStore";
import SEO from "@/components/SEO";
import BackToHome from "@/components/BackToHome";

export default function Terms() {
  const locale = useI18n((s) => s.locale);

  if (locale === "en") {
    return (
      <div className="min-h-screen bg-background">
        <SEO
          title="Terms"
          description="Terms of Service. HomyHomegrow - Andreas Meyer, Fellbach."
        />
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
          <BackToHome />
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground font-heading mb-8">
            Terms of Service
          </h1>
          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            <p className="text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleDateString("en-DE")}
            </p>
            <p>
              <strong className="text-foreground">1. Provider</strong>
              <br />
              This website is operated by Andreas Meyer, c/o Block Services,
              Stuttgarter Str. 106, 70736 Fellbach, Germany. Contact:{" "}
              <a
                href="mailto:info@homyhomegrow.com"
                className="text-[#39FF14] hover:underline"
              >
                info@homyhomegrow.com
              </a>
            </p>
            <p>
              <strong className="text-foreground">2. Scope</strong>
              <br />
              These terms apply to all users of the HomyHomegrow website and
              services.
            </p>
            <p>
              <strong className="text-foreground">3. Services</strong>
              <br />
              We provide educational content about cannabis cultivation. All
              content is for informational purposes only. We do not encourage
              illegal cultivation, possession, or consumption of cannabis.
            </p>
            <p>
              <strong className="text-foreground">
                4. Age Restriction &amp; User Obligations
              </strong>
              <br />- Users must be at least 18 years old
              <br />- Users must comply with all applicable laws in their
              jurisdiction
              <br />- Users may not use the content for illegal purposes
              <br />- Users confirm they are in a jurisdiction where the
              information is legally permitted
            </p>
            <p>
              <strong className="text-foreground">5. Disclaimer</strong>
              <br />
              We are not liable for any damages resulting from the use of our
              content. Users act at their own risk. The information provided
              does not constitute professional or legal advice.
            </p>
            <p>
              <strong className="text-foreground">
                6. Intellectual Property
              </strong>
              <br />
              All content on this website is protected by copyright. Reproduction
              without written permission is prohibited.
            </p>
            <p>
              <strong className="text-foreground">7. Changes</strong>
              <br />
              We reserve the right to modify these terms at any time. Continued
              use constitutes acceptance.
            </p>
            <p>
              <strong className="text-foreground">8. Governing Law</strong>
              <br />
              These terms are governed by the laws of the Federal Republic of
              Germany. Place of jurisdiction is Stuttgart.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="AGB"
        description="Allgemeine Geschäftsbedingungen. HomyHomegrow - Andreas Meyer, Fellbach."
      />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
        <BackToHome />
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground font-heading mb-8">
          Allgemeine Geschäftsbedingungen
        </h1>
        <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
          <p className="text-sm text-muted-foreground">
            Stand: {new Date().toLocaleDateString("de-DE")}
          </p>
          <p>
            <strong className="text-foreground">1. Anbieter</strong>
            <br />
            Diese Website wird betrieben von Andreas Meyer, c/o Block Services,
            Stuttgarter Str. 106, 70736 Fellbach, Deutschland. Kontakt:{" "}
            <a
              href="mailto:info@homyhomegrow.com"
              className="text-[#39FF14] hover:underline"
            >
              info@homyhomegrow.com
            </a>
          </p>
          <p>
            <strong className="text-foreground">2. Geltungsbereich</strong>
            <br />
            Diese Bedingungen gelten für alle Nutzer der HomyHomegrow Website
            und Dienste.
          </p>
          <p>
            <strong className="text-foreground">3. Leistungen</strong>
            <br />
            Wir stellen Bildungsinhalte zum Cannabis-Anbau bereit. Alle Inhalte
            dienen ausschließlich der Information. Wir fördern nicht den
            illegalen Anbau, Besitz oder Konsum von Cannabis.
          </p>
          <p>
            <strong className="text-foreground">
              4. Altersbeschränkung &amp; Pflichten der Nutzer
            </strong>
            <br />- Nutzer müssen mindestens 18 Jahre alt sein
            <br />- Nutzer müssen die geltenden Gesetze ihres Landes einhalten
            <br />- Nutzer dürfen die Inhalte nicht für illegale Zwecke nutzen
            <br />- Nutzer bestätigen, sich in einer Gerichtsbarkeit zu
            befinden, in der die Informationen rechtlich zulässig sind
          </p>
          <p>
            <strong className="text-foreground">5. Haftungsausschluss</strong>
            <br />
            Wir haften nicht für Schäden, die aus der Nutzung unserer Inhalte
            resultieren. Nutzer handeln auf eigene Verantwortung. Die
            bereitgestellten Informationen stellen keine professionelle oder
            rechtliche Beratung dar.
          </p>
          <p>
            <strong className="text-foreground">6. Urheberrecht</strong>
            <br />
            Alle Inhalte auf dieser Website sind urheberrechtlich geschützt.
            Vervielfältigung ohne schriftliche Genehmigung ist untersagt.
          </p>
          <p>
            <strong className="text-foreground">7. Änderungen</strong>
            <br />
            Wir behalten uns das Recht vor, diese Bedingungen jederzeit zu
            ändern. Die weitere Nutzung gilt als Zustimmung.
          </p>
          <p>
            <strong className="text-foreground">8. Anwendbares Recht</strong>
            <br />
            Diese Bedingungen unterliegen dem Recht der Bundesrepublik
            Deutschland. Gerichtsstand ist Stuttgart.
          </p>
        </div>
      </div>
    </div>
  );
}
