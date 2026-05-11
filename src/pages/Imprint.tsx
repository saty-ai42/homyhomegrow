import { useT } from "@/stores/i18nStore";
import SEO from "@/components/SEO";
import BackToHome from "@/components/BackToHome";

export default function Imprint() {
  const t = useT();
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Impressum"
        description="Impressum gemäß § 5 TMG. HomyHomegrow - Andreas Meyer, Fellbach."
      />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
        <BackToHome />
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground font-heading mb-8">
          {t("Impressum", "Imprint")}
        </h1>

        <div className="prose prose-invert max-w-none space-y-8 text-muted-foreground">
          {/* Angaben gemäß § 5 TMG */}
          <section>
            <h2 className="text-xl font-bold text-foreground font-heading mb-3">
              {t("Angaben gemäß § 5 TMG", "Information according to § 5 TMG")}
            </h2>
            <p className="text-foreground">
              <strong>Andreas Meyer</strong>
              <br />
              c/o Block Services
              <br />
              Stuttgarter Str. 106
              <br />
              70736 Fellbach
              <br />
              Deutschland
            </p>
          </section>

          {/* Kontakt */}
          <section>
            <h2 className="text-xl font-bold text-foreground font-heading mb-3">
              {t("Kontakt", "Contact")}
            </h2>
            <p>
              E-Mail:{" "}
              <a
                href="mailto:info@homyhomegrow.com"
                className="text-[#39FF14] hover:underline"
              >
                info@homyhomegrow.com
              </a>
              <br />
              Web:{" "}
              <a
                href="https://homyhomegrow.de"
                className="text-[#39FF14] hover:underline"
              >
                https://homyhomegrow.de
              </a>
            </p>
          </section>

          {/* Vertretungsberechtigt */}
          <section>
            <h2 className="text-xl font-bold text-foreground font-heading mb-3">
              {t("Vertreten durch", "Represented by")}
            </h2>
            <p>Andreas Meyer (Verantwortlicher i.S.d. § 55 Abs. 2 RStV)</p>
          </section>

          {/* Privater Zweck */}
          <section>
            <h2 className="text-xl font-bold text-foreground font-heading mb-3">
              {t("Hinweis", "Note")}
            </h2>
            <p>
              {t(
                "Dies ist eine rein private Website ohne Gewerbeanmeldung. Es besteht keine Umsatzsteuerpflicht. Die Website dient ausschließlich der Information und Community-Bildung.",
                "This is a purely private website without business registration. There is no VAT obligation. The website serves exclusively for information and community building."
              )}
            </p>
          </section>

          {/* Verantwortlich für Inhalte */}
          <section>
            <h2 className="text-xl font-bold text-foreground font-heading mb-3">
              {t(
                "Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV",
                "Responsible for content according to § 55 para. 2 RStV"
              )}
            </h2>
            <p className="text-foreground">
              Andreas Meyer
              <br />
              c/o Block Services
              <br />
              Stuttgarter Str. 106
              <br />
              70736 Fellbach
            </p>
          </section>

          {/* EU-Streitschlichtung */}
          <section>
            <h2 className="text-xl font-bold text-foreground font-heading mb-3">
              {t(
                "EU-Streitschlichtung",
                "EU Dispute Resolution"
              )}
            </h2>
            <p>
              {t(
                "Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:",
                "The European Commission provides a platform for online dispute resolution (ODR):"
              )}{" "}
              <a
                href="https://ec.europa.eu/consumers/odr/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#39FF14] hover:underline"
              >
                https://ec.europa.eu/consumers/odr/
              </a>
            </p>
            <p>
              {t(
                "Unsere E-Mail-Adresse finden Sie oben im Impressum. Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.",
                "Our email address can be found above in the imprint. We are not willing or obliged to participate in dispute resolution proceedings before a consumer arbitration board."
              )}
            </p>
          </section>

          {/* Haftungsausschluss */}
          <section>
            <h2 className="text-xl font-bold text-foreground font-heading mb-3">
              {t("Haftungsausschluss", "Liability Disclaimer")}
            </h2>

            <h3 className="text-lg font-semibold text-foreground mb-2">
              {t("Haftung für Inhalte", "Liability for Content")}
            </h3>
            <p>
              {t(
                "Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt.",
                "As a service provider, we are responsible for our own content on these pages in accordance with § 7 para. 1 TMG under general laws. However, according to §§ 8 to 10 TMG, we as service providers are not obligated to monitor transmitted or stored third-party information or to investigate circumstances that indicate illegal activity."
              )}
            </p>

            <h3 className="text-lg font-semibold text-foreground mb-2 mt-4">
              {t("Haftung für Links", "Liability for Links")}
            </h3>
            <p>
              {t(
                "Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.",
                "Our offer contains links to external third-party websites over whose content we have no influence. Therefore, we cannot assume any liability for these external contents."
              )}
            </p>

            <h3 className="text-lg font-semibold text-foreground mb-2 mt-4">
              {t("Urheberrecht", "Copyright")}
            </h3>
            <p>
              {t(
                "Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.",
                "The contents and works created by the site operators on these pages are subject to German copyright law."
              )}
            </p>
          </section>

          {/* Bildungszweck */}
          <section className="p-4 rounded-lg bg-[#39FF14]/5 border border-[#39FF14]/20">
            <h2 className="text-lg font-bold text-[#39FF14] font-heading mb-3">
              {t("Hinweis zu Cannabis-Inhalten", "Note on Cannabis Content")}
            </h2>
            <p>
              {t(
                "Diese Website dient ausschließlich Bildungs- und Informationszwecken im Rahmen der geltenden Gesetze. Alle Informationen über Cannabis-Anbau sind für Länder bestimmt, in denen der Anbau legal ist. Wir fördern nicht den illegalen Anbau, Besitz oder Konsum von Cannabis.",
                "This website serves exclusively educational and informational purposes within the framework of applicable laws. All information about cannabis cultivation is intended for countries where cultivation is legal."
              )}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
