import { useI18n } from "@/stores/i18nStore";
import SEO from "@/components/SEO";
import BackToHome from "@/components/BackToHome";

export default function Privacy() {
  const locale = useI18n((s) => s.locale);

  if (locale === "en") {
    return (
      <div className="min-h-screen bg-background">
        <SEO
          title="Privacy Policy"
          description="Privacy Policy according to GDPR. HomyHomegrow - Andreas Meyer, Fellbach."
        />
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
          <BackToHome />
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground font-heading mb-8">
            Privacy Policy
          </h1>

          <div className="prose prose-invert max-w-none space-y-8 text-muted-foreground">
            <p className="text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleDateString("en-DE")}
            </p>

            <section>
              <h2 className="text-xl font-bold text-foreground font-heading mb-3">
                1. Data Controller
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
                Germany
              </p>
              <p className="mt-2">
                Email:{" "}
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

            <section>
              <h2 className="text-xl font-bold text-foreground font-heading mb-3">
                2. Data Protection Officer
              </h2>
              <p>
                We have appointed a data protection officer. You can reach them
                at:{" "}
                <a
                  href="mailto:info@homyhomegrow.com"
                  className="text-[#39FF14] hover:underline"
                >
                  info@homyhomegrow.com
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground font-heading mb-3">
                3. What Data We Collect
              </h2>
              <p>
                We process the following categories of personal data:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>Account data:</strong> Name, email address (via Kimi
                  OAuth login)
                </li>
                <li>
                  <strong>Newsletter data:</strong> Email address, optional name
                </li>
                <li>
                  <strong>Usage data:</strong> IP address (anonymized), browser
                  type, visited pages, timestamps
                </li>
                <li>
                  <strong>Technical data:</strong> Cookies, session tokens,
                  language and theme preferences
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground font-heading mb-3">
                4. Legal Basis for Processing (Art. 6 GDPR)
              </h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>Art. 6(1)(a) GDPR:</strong> Consent (newsletter
                  subscription, optional cookies)
                </li>
                <li>
                  <strong>Art. 6(1)(b) GDPR:</strong> Contract fulfillment
                  (account functionality)
                </li>
                <li>
                  <strong>Art. 6(1)(f) GDPR:</strong> Legitimate interest
                  (website security, analytics, spam prevention)
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground font-heading mb-3">
                5. Purpose of Processing
              </h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Providing our website and services</li>
                <li>User authentication (via Kimi OAuth)</li>
                <li>Newsletter delivery (only with explicit consent)</li>
                <li>Website analytics (anonymous page views)</li>
                <li>Security and spam prevention</li>
                <li>Technical optimization</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground font-heading mb-3">
                6. Cookies &amp; Local Storage
              </h2>
              <p>We use the following cookies and local storage:</p>
              <table className="w-full text-sm border border-border rounded-lg overflow-hidden mt-2">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-2 text-foreground">Name</th>
                    <th className="text-left p-2 text-foreground">Purpose</th>
                    <th className="text-left p-2 text-foreground">
                      Duration
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-border">
                    <td className="p-2">theme</td>
                    <td className="p-2">Stores dark/light mode preference</td>
                    <td className="p-2">Persistent</td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="p-2">locale</td>
                    <td className="p-2">Stores language preference (DE/EN)</td>
                    <td className="p-2">Persistent</td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="p-2">ageVerified</td>
                    <td className="p-2">Stores age gate confirmation</td>
                    <td className="p-2">30 days</td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="p-2">cookieConsent</td>
                    <td className="p-2">Stores cookie banner decision</td>
                    <td className="p-2">1 year</td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="p-2">JWT Session</td>
                    <td className="p-2">Authentication (HttpOnly cookie)</td>
                    <td className="p-2">Session</td>
                  </tr>
                </tbody>
              </table>
              <p className="mt-2">
                Essential cookies cannot be disabled. You can manage optional
                cookies via our cookie banner.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground font-heading mb-3">
                7. Newsletter
              </h2>
              <p>
                With your consent (Art. 6(1)(a) GDPR), we send newsletters to
                your email address. Subscription requires double opt-in:
                confirmation via email link. You can unsubscribe at any time by
                clicking the unsubscribe link in the email or emailing us at{" "}
                <a
                  href="mailto:info@homyhomegrow.com"
                  className="text-[#39FF14] hover:underline"
                >
                  info@homyhomegrow.com
                </a>
                .
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground font-heading mb-3">
                8. Third-Party Services
              </h2>
              <p>We use the following third-party services:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>Kimi (auth.kimi.com):</strong> OAuth authentication.
                  Data: name, email. Privacy policy:{" "}
                  <a
                    href="https://www.kimi.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#39FF14] hover:underline"
                  >
                    kimi.com/privacy
                  </a>
                </li>
                <li>
                  <strong>Hosting:</strong> Currently Kimi Cloud (EU-based).
                  After migration: WebGo (Germany).
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground font-heading mb-3">
                9. Data Retention
              </h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>Account data:</strong> Until account deletion
                </li>
                <li>
                  <strong>Newsletter data:</strong> Until unsubscription
                </li>
                <li>
                  <strong>Analytics data:</strong> 12 months
                </li>
                <li>
                  <strong>Server logs:</strong> 7 days
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground font-heading mb-3">
                10. Your Rights (Art. 15-21 GDPR)
              </h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>Access</strong> your personal data (Art. 15 GDPR)
                </li>
                <li>
                  <strong>Rectification</strong> of inaccurate data (Art. 16
                  GDPR)
                </li>
                <li>
                  <strong>Erasure</strong> ("right to be forgotten") (Art. 17
                  GDPR)
                </li>
                <li>
                  <strong>Restriction</strong> of processing (Art. 18 GDPR)
                </li>
                <li>
                  <strong>Data portability</strong> (Art. 20 GDPR)
                </li>
                <li>
                  <strong>Objection</strong> to processing (Art. 21 GDPR)
                </li>
                <li>
                  <strong>Withdraw consent</strong> at any time (Art. 7(3)
                  GDPR)
                </li>
              </ul>
              <p className="mt-2">
                To exercise your rights, contact us at:{" "}
                <a
                  href="mailto:info@homyhomegrow.com"
                  className="text-[#39FF14] hover:underline"
                >
                  info@homyhomegrow.com
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground font-heading mb-3">
                11. Data Security
              </h2>
              <p>
                We use SSL/TLS encryption (HTTPS), secure authentication via JWT
                tokens (HttpOnly cookies), rate limiting, and input validation.
                Our server runs with Content Security Policy (CSP) headers.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground font-heading mb-3">
                12. Right to Complain
              </h2>
              <p>
                You have the right to complain to a supervisory authority. The
                responsible authority for us is:{" "}
                <a
                  href="https://www.baden-wuerttemberg.datenschutz.de/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#39FF14] hover:underline"
                >
                  Der Landesbeauftragte für den Datenschutz Baden-Württemberg
                </a>
                , Königstraße 10a, 70173 Stuttgart.
              </p>
            </section>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Datenschutzerklärung"
        description="Datenschutzerklärung gemäß DSGVO. HomyHomegrow - Andreas Meyer, Fellbach."
      />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
        <BackToHome />
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground font-heading mb-8">
          Datenschutzerklärung
        </h1>

        <div className="prose prose-invert max-w-none space-y-8 text-muted-foreground">
          <p className="text-sm text-muted-foreground">
            Stand: {new Date().toLocaleDateString("de-DE")}
          </p>

          {/* 1. Verantwortlicher */}
          <section>
            <h2 className="text-xl font-bold text-foreground font-heading mb-3">
              1. Verantwortlicher
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
            <p className="mt-2">
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

          {/* 2. Datenschutzbeauftragter */}
          <section>
            <h2 className="text-xl font-bold text-foreground font-heading mb-3">
              2. Datenschutzbeauftragter
            </h2>
            <p>
              Wir haben einen Datenschutzbeauftragten bestellt. Sie erreichen
              diesen unter:{" "}
              <a
                href="mailto:info@homyhomegrow.com"
                className="text-[#39FF14] hover:underline"
              >
                info@homyhomegrow.com
              </a>
            </p>
          </section>

          {/* 3. Welche Daten erheben wir */}
          <section>
            <h2 className="text-xl font-bold text-foreground font-heading mb-3">
              3. Welche Daten wir erheben
            </h2>
            <p>
              Wir verarbeiten folgende Kategorien personenbezogener Daten:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Kontodaten:</strong> Name, E-Mail-Adresse (via Kimi
                OAuth Login)
              </li>
              <li>
                <strong>Newsletterdaten:</strong> E-Mail-Adresse, optional Name
              </li>
              <li>
                <strong>Nutzungsdaten:</strong> IP-Adresse (anonymisiert),
                Browsertyp, besuchte Seiten, Zeitstempel
              </li>
              <li>
                <strong>Technische Daten:</strong> Cookies, Session-Token,
                Sprach- und Theme-Einstellungen
              </li>
            </ul>
          </section>

          {/* 4. Rechtsgrundlagen */}
          <section>
            <h2 className="text-xl font-bold text-foreground font-heading mb-3">
              4. Rechtsgrundlagen der Verarbeitung (Art. 6 DSGVO)
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Art. 6 Abs. 1 lit. a DSGVO:</strong> Einwilligung
                (Newsletter-Abonnement, optionale Cookies)
              </li>
              <li>
                <strong>Art. 6 Abs. 1 lit. b DSGVO:</strong> Vertragserfüllung
                (Kontofunktionalität)
              </li>
              <li>
                <strong>Art. 6 Abs. 1 lit. f DSGVO:</strong> Berechtigtes
                Interesse (Website-Sicherheit, Analyse, Spam-Prävention)
              </li>
            </ul>
          </section>

          {/* 5. Zwecke */}
          <section>
            <h2 className="text-xl font-bold text-foreground font-heading mb-3">
              5. Zwecke der Verarbeitung
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Bereitstellung unserer Website und Dienste</li>
              <li>Nutzer-Authentifizierung (via Kimi OAuth)</li>
              <li>Newsletter-Versand (nur mit ausdrücklicher Einwilligung)</li>
              <li>Website-Analyse (anonyme Seitenaufrufe)</li>
              <li>Sicherheit und Spam-Prävention</li>
              <li>Technische Optimierung</li>
            </ul>
          </section>

          {/* 6. Cookies */}
          <section>
            <h2 className="text-xl font-bold text-foreground font-heading mb-3">
              6. Cookies &amp; Local Storage
            </h2>
            <p>
              Wir verwenden folgende Cookies und Local Storage Einträge:
            </p>
            <table className="w-full text-sm border border-border rounded-lg overflow-hidden mt-2">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-2 text-foreground">Name</th>
                  <th className="text-left p-2 text-foreground">Zweck</th>
                  <th className="text-left p-2 text-foreground">Dauer</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="p-2">theme</td>
                  <td className="p-2">
                    Speichert Dark/Light Mode Präferenz
                  </td>
                  <td className="p-2">Dauerhaft</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="p-2">locale</td>
                  <td className="p-2">
                    Speichert Spracheinstellung (DE/EN)
                  </td>
                  <td className="p-2">Dauerhaft</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="p-2">ageVerified</td>
                  <td className="p-2">Speichert Age-Gate Bestätigung</td>
                  <td className="p-2">30 Tage</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="p-2">cookieConsent</td>
                  <td className="p-2">Speichert Cookie-Banner Entscheidung</td>
                  <td className="p-2">1 Jahr</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="p-2">JWT Session</td>
                  <td className="p-2">
                    Authentifizierung (HttpOnly Cookie)
                  </td>
                  <td className="p-2">Sitzung</td>
                </tr>
              </tbody>
            </table>
            <p className="mt-2">
              Essenzielle Cookies können nicht deaktiviert werden. Optionale
              Cookies können Sie über unser Cookie-Banner verwalten.
            </p>
          </section>

          {/* 7. Newsletter */}
          <section>
            <h2 className="text-xl font-bold text-foreground font-heading mb-3">
              7. Newsletter
            </h2>
            <p>
              Mit Ihrer Einwilligung (Art. 6 Abs. 1 lit. a DSGVO) versenden wir
              Newsletter an Ihre E-Mail-Adresse. Die Anmeldung erfordert ein
              Double-Opt-In: Bestätigung per E-Mail-Link. Sie können sich
              jederzeit abmelden per Link in der E-Mail oder per E-Mail an{" "}
              <a
                href="mailto:info@homyhomegrow.com"
                className="text-[#39FF14] hover:underline"
              >
                info@homyhomegrow.com
              </a>
              .
            </p>
          </section>

          {/* 8. Drittanbieter */}
          <section>
            <h2 className="text-xl font-bold text-foreground font-heading mb-3">
              8. Drittanbieter
            </h2>
            <p>Wir nutzen folgende Drittanbieter:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Kimi (auth.kimi.com):</strong> OAuth Authentifizierung.
                Daten: Name, E-Mail. Datenschutz:{" "}
                <a
                  href="https://www.kimi.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#39FF14] hover:underline"
                >
                  kimi.com/privacy
                </a>
              </li>
              <li>
                <strong>Hosting:</strong> Aktuell Kimi Cloud (EU-Standort).
                Nach Umzug: WebGo (Deutschland).
              </li>
            </ul>
          </section>

          {/* 9. Aufbewahrungsdauer */}
          <section>
            <h2 className="text-xl font-bold text-foreground font-heading mb-3">
              9. Aufbewahrungsdauer
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Kontodaten:</strong> Bis zur Kontolöschung
              </li>
              <li>
                <strong>Newsletterdaten:</strong> Bis zur Abmeldung
              </li>
              <li>
                <strong>Analysedaten:</strong> 12 Monate
              </li>
              <li>
                <strong>Server-Logs:</strong> 7 Tage
              </li>
            </ul>
          </section>

          {/* 10. Betroffenenrechte */}
          <section>
            <h2 className="text-xl font-bold text-foreground font-heading mb-3">
              10. Ihre Rechte (Art. 15-21 DSGVO)
            </h2>
            <p>Sie haben folgende Rechte:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Auskunft</strong> über Ihre gespeicherten Daten (Art. 15
                DSGVO)
              </li>
              <li>
                <strong>Berichtigung</strong> unrichtiger Daten (Art. 16 DSGVO)
              </li>
              <li>
                <strong>Löschung</strong> ("Recht auf Vergessenwerden") (Art. 17
                DSGVO)
              </li>
              <li>
                <strong>Einschränkung</strong> der Verarbeitung (Art. 18 DSGVO)
              </li>
              <li>
                <strong>Datenübertragbarkeit</strong> (Art. 20 DSGVO)
              </li>
              <li>
                <strong>Widerspruch</strong> gegen Verarbeitung (Art. 21 DSGVO)
              </li>
              <li>
                <strong>Einwilligung widerrufen</strong> jederzeit (Art. 7 Abs. 3
                DSGVO)
              </li>
            </ul>
            <p className="mt-2">
              Zur Ausübung Ihrer Rechte kontaktieren Sie uns:{" "}
              <a
                href="mailto:info@homyhomegrow.com"
                className="text-[#39FF14] hover:underline"
              >
                info@homyhomegrow.com
              </a>
            </p>
          </section>

          {/* 11. Datensicherheit */}
          <section>
            <h2 className="text-xl font-bold text-foreground font-heading mb-3">
              11. Datensicherheit
            </h2>
            <p>
              Wir setzen SSL/TLS-Verschlüsselung (HTTPS), sichere
              Authentifizierung via JWT-Token (HttpOnly Cookies), Rate Limiting
              und Input-Validierung ein. Unser Server läuft mit Content Security
              Policy (CSP) Headern.
            </p>
          </section>

          {/* 12. Beschwerderecht */}
          <section>
            <h2 className="text-xl font-bold text-foreground font-heading mb-3">
              12. Beschwerderecht
            </h2>
            <p>
              Sie haben das Recht, sich bei einer Aufsichtsbehörde zu
              beschweren. Für uns zuständig:{" "}
              <a
                href="https://www.baden-wuerttemberg.datenschutz.de/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#39FF14] hover:underline"
              >
                Der Landesbeauftragte für den Datenschutz Baden-Württemberg
              </a>
              , Königstraße 10a, 70173 Stuttgart.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
