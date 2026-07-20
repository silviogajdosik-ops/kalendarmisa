/**
 * fixed-prayers.js
 * Stalni (nepromjenjivi) dijelovi reda mise na hrvatskom jeziku.
 * Ovi tekstovi se NE mijenjaju iz dana u dan pa su hardkodirani ovdje,
 * za razliku od promjenjivih čitanja koja dolaze iz data.json.
 */

const STALNE_MOLITVE = {
  znakKriza: {
    naslov: "Znak križa",
    tekst: "U ime Oca i Sina i Duha Svetoga. Amen."
  },

  pozdrav: {
    naslov: "Pozdrav",
    tekst: "Milost Gospodina našega Isusa Krista, ljubav Boga i zajedništvo Duha Svetoga sa svima vama. I s duhom tvojim."
  },

  cinPokoreIspovijedam: {
    naslov: "Čin pokore - Ispovijedam se",
    tekst: "Ispovijedam se Bogu svemogućemu i vama, braćo i sestre, da sagriješih vrlo mnogo mišlju, riječju, djelom i propustom: moj grijeh, moj grijeh, moj preveliki grijeh. Zato molim blaženu Mariju vazda Djevicu, sve anđele i svete i vas, braćo i sestre, da molite za mene Gospodina, Boga našega."
  },

  cinPokoreKyrie: {
    naslov: "Čin pokore - Gospodine, smiluj se",
    tekst: "Gospodine, smiluj se. Gospodine, smiluj se. Kriste, smiluj se. Kriste, smiluj se. Gospodine, smiluj se. Gospodine, smiluj se."
  },

  slavaBoguNaVisini: {
    naslov: "Slava Bogu na visini (Gloria)",
    tekst: "Slava Bogu na visini, a na zemlji mir ljudima, miljenicima njegovim. Hvalimo te. Blagoslivljamo te. Klanjamo ti se. Slavimo te. Zahvaljujemo ti radi velike slave tvoje. Gospodine Bože, kralju nebeski, Bože, Oče svemogući. Gospodine Sine jedinorođeni, Isuse Kriste. Gospodine Bože, Jaganjče Božji, Sine Očev. Ti koji oduzimaš grijehe svijeta, smiluj nam se. Ti koji oduzimaš grijehe svijeta, primi našu molitvu. Ti koji sjediš s desne Ocu, smiluj nam se. Jer ti si jedini Svet, ti si jedini Gospodin, ti si jedini Svevišnji, Isuse Kriste, sa Svetim Duhom: u slavi Boga Oca. Amen.",
    napomena: "Izostavlja se nedjeljom u došašću i korizmi."
  },

  vjerovanjeDugo: {
    naslov: "Vjerovanje - Nicejsko-carigradsko",
    tekst: "Vjerujem u jednoga Boga, Oca svemogućega, stvoritelja neba i zemlje, svega vidljivoga i nevidljivoga. I u jednoga Gospodina Isusa Krista, jedinorođenoga Sina Božjega. Rođenoga od Oca prije svih vjekova: Boga od Boga, Svjetlo od Svjetla, pravoga Boga od pravoga Boga; rođena, ne stvorena, istobitna s Ocem, po kome je sve stvoreno. Koji je radi nas ljudi i radi našega spasenja sišao s nebesa. I utjelovio se po Duhu Svetom od Marije Djevice: i postao čovjekom. Raspet također za nas pod Poncijem Pilatom, mučen i pokopan. I uskrsnuo treći dan, po Svetom pismu. I uzašao na nebo: sjedi s desne Ocu. I opet će doći u slavi suditi žive i mrtve, i njegovu kraljevstvu neće biti kraja. I u Duha Svetoga, Gospodina i Životvorca; koji izlazi od Oca i Sina. Koji se s Ocem i Sinom skupa časti i zajedno slavi; koji je govorio po prorocima. I u jednu, svetu, katoličku i apostolsku Crkvu. Ispovijedam jedno krštenje za oproštenje grijeha. I iščekujem uskrsnuće mrtvih. I život budućega vijeka. Amen.",
    napomena: "Kod riječi 'I utjelovio se po Duhu Svetom od Marije Djevice: i postao čovjekom' vjernici se duboko naklone."
  },

  vjerovanjeKratko: {
    naslov: "Vjerovanje - Apostolsko",
    tekst: "Vjerujem u Boga, Oca svemogućega, Stvoritelja neba i zemlje. I u Isusa Krista, Sina njegova jedinoga, Gospodina našega, koji je začet po Duhu Svetom, rođen od Marije Djevice, mučen pod Poncijem Pilatom, raspet, umro i pokopan; sašao nad pakao, treći dan uskrsnuo od mrtvih; uzašao na nebesa, sjedi o desnu Boga Oca svemogućega; odonud će doći suditi žive i mrtve. Vjerujem u Duha Svetoga, svetu Crkvu katoličku, općinstvo svetih, oproštenje grijeha, uskrsnuće tijela i život vječni. Amen."
  },

  molitvaVjernikaUvod: {
    naslov: "Molitva vjernika - uvod",
    tekst: "Nakon svake nakane odgovaramo: Molimo Te, usliši nas. (ili drugi dogovoreni pripjev)"
  },

  prikazanjeDarova: {
    naslov: "Prikazanje darova",
    tekst: "Blagoslovljen si, Gospodine, Bože svega svijeta, jer smo od tvoje darežljivosti primili kruh koji ti prinosimo, plod zemlje i rada ljudskih ruku: on će nam postati kruh života. Blagoslovljen Bog u vijeke. Blagoslovljen si, Gospodine, Bože svega svijeta, jer smo od tvoje darežljivosti primili vino koje ti prinosimo, plod trsa i rada ljudskih ruku: ono će nam postati piće duhovno. Blagoslovljen Bog u vijeke."
  },

  svet: {
    naslov: "Svet (Sanctus)",
    tekst: "Svet, svet, svet Gospodin Bog Sabaot! Puna su nebesa i zemlja slave tvoje! Hosana u visini! Blagoslovljen koji dolazi u ime Gospodnje! Hosana u visini!"
  },

  otajstvoVjere: {
    naslov: "Otajstvo vjere",
    tekst: "Naviještamo smrt tvoju, Gospodine, i ispovijedamo uskrsnuće tvoje, dok ne dođeš u slavi."
  },

  oceNas: {
    naslov: "Oče naš",
    tekst: "Oče naš, koji jesi na nebesima, sveti se ime tvoje, dođi kraljevstvo tvoje, budi volja tvoja, kako na nebu tako i na zemlji. Kruh naš svagdanji daj nam danas, i otpusti nam duge naše, kako i mi otpuštamo dužnicima našim, i ne uvedi nas u napast, nego izbavi nas od zla."
  },

  embolizam: {
    naslov: "Embolizam i doksologija",
    tekst: "Izbavi nas, Gospodine, od svih zala, milostivo daj mir u naše dane, da uz pomoć tvog milosrđa budemo svagda slobodni od grijeha i sigurni od svih nevolja, dok očekujemo blaženu nadu i dolazak Spasitelja našega Isusa Krista. Jer tvoje je kraljevstvo, i slava, i moć, u vijekove. Amen."
  },

  znakMira: {
    naslov: "Znak mira",
    tekst: "Gospodine Isuse Kriste, ti si rekao svojim apostolima: Mir vam ostavljam, mir vam svoj dajem. Ne gledaj na grijehe naše, nego na vjeru svoje Crkve, i podaj joj mir i jedinstvo kako je tvoja volja. Koji živiš i kraljuješ u vijeke vjekova. Amen. Mir Gospodnji neka bude uvijek s vama. I s duhom tvojim. Pružite jedni drugima znak mira."
  },

  jaganjceBozji: {
    naslov: "Jaganjče Božji (Agnus Dei)",
    tekst: "Jaganjče Božji, koji oduzimaš grijehe svijeta, smiluj nam se. Jaganjče Božji, koji oduzimaš grijehe svijeta, smiluj nam se. Jaganjče Božji, koji oduzimaš grijehe svijeta, daruj nam mir."
  },

  pozivNaPricest: {
    naslov: "Poziv na pričest",
    tekst: "Evo Jaganjca Božjega, evo onoga koji oduzima grijehe svijeta. Blago onima koji su pozvani na Gospodnju gozbu. Gospodine, nisam dostojan da uniđeš pod krov moj, nego samo reci riječ i ozdravit će duša moja."
  },

  blagoslov: {
    naslov: "Blagoslov",
    tekst: "Gospodin s vama. I s duhom tvojim. Blagoslovio vas svemogući Bog, Otac i Sin i Duh Sveti. Amen."
  },

  otpust: {
    naslov: "Otpust",
    varijante: [
      "Idite u miru Božjemu.",
      "Idite, pošalje je (misa svršena).",
      "Idite i navješćujte Evanđelje Gospodnje.",
      "Idite u miru, slaveći Gospodina svojim životom."
    ],
    odgovor: "Bogu hvala."
  }
};

// Izvoz za korištenje u app.js (obični <script> ucitava globalnu varijablu)
if (typeof module !== "undefined" && module.exports) {
  module.exports = STALNE_MOLITVE;
}
