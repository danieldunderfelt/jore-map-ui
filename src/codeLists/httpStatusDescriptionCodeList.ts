const httpStatusDescriptionCodeList = {
    403: 'Tämä toimenpide on kieletty, ohjaamme sinut sisäänkirjautumiseen. Istuntosi on myös saattanut vanhentua.',
    409: 'Tallennus ei onnistunut, sillä karttakäyttöliittymän sisäinen tietokanta ei ollut ajantasalla jore tietokannan kanssa. Päivitä sivu ja yritä tallentaa uudelleen.',
    550: 'Tallennus estetty, infopoiminta käynnissä.',
};

export default httpStatusDescriptionCodeList;
