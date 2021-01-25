// import uuid from 'react-uuid';
var uuid = require('react-uuid')

const initialData = 
  [{
    tenttiid: uuid(),
    tentti: "TENTTI A",
    kysymykset: [
      {
        kysymysid: uuid(),
        kysymys: "Mitä kuuluu?",
        vaihtoehdot: [
          {
            vaihtoehtoid: uuid(),
            vaihtoehto: "Kiitos hyvää, entä sinulle?",
            valittu: 0,
            korrekti: 1
          },
          {
            vaihtoehtoid: uuid(),
            vaihtoehto: "Siinähän se!",
            valittu: 0,
            korrekti: 0
          },
          {
            vaihtoehtoid: uuid(),
            vaihtoehto: "Mitäs siinä kyselet, hoida omat asias!",
            valittu: 0,
            korrekti: 0
          }
        ]
      },
      {
        kysymysid: uuid(),
        kysymys: "Miten työpäivä meni?",
        vaihtoehdot: [
          {
            vaihtoehtoid: uuid(),
            vaihtoehto: "Kiitos, uni maistui!",
            valittu: 0,
            korrekti: 0
          },
          {
            vaihtoehtoid: uuid(),
            vaihtoehto: "Pelastin maailman!",
            valittu: 0,
            korrekti: 0
          },
          {
            vaihtoehtoid: uuid(),
            vaihtoehto: "Kuis ittelläs?",
            valittu: 0,
            korrekti: 0
          },
          {
            vaihtoehtoid: uuid(),
            vaihtoehto: "Tein töitä palkkani edestä.",
            valittu: 0,
            korrekti: 1
          }
        ]
      },
      {
        kysymysid: uuid(),
        kysymys: "Suomi on?",
        vaihtoehdot: [
          {
            vaihtoehtoid: uuid(),
            vaihtoehto: "Itsenäinen muista riippumaton tasavalta!",
            valittu: 0,
            korrekti: 0
          },
          {
            vaihtoehtoid: uuid(),
            vaihtoehto: "Kuningaskunta!",
            valittu: 0,
            korrekti: 0
          },
          {
            vaihtoehtoid: uuid(),
            vaihtoehto: "Yksi EU:n jäsenvaltioista!",
            valittu: 0,
            korrekti: 1
          }
        ]
      }
    ]
  }]

  module.exports = {
    initialData
}