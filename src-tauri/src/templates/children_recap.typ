#import sys: inputs

#set page(paper: "a4", margin: (top: 1.5cm, bottom: 1.5cm, left: 1.5cm, right: 1.5cm))
#set text(font: "TeX Gyre Cursor", size: 10pt, lang: "fr")

#let data = inputs

#align(center)[
  #text(size: 16pt, weight: "bold")[Récapitulatif des enfants]
]

#v(0.5cm)

#let checkbox(checked) = {
  box(
    width: 8pt,
    height: 8pt,
    stroke: 0.7pt + black,
    fill: if checked { luma(60) } else { white },
    radius: 1pt,
    baseline: 1pt,
  )
}

#let list_or_dash(items) = {
  if items.len() == 0 {
    text(fill: luma(150))[—]
  } else {
    items.join(", ")
  }
}

#let phone_display(number, corrected) = {
  if corrected != "" and corrected != number [
    #strike(stroke: luma(120))[#text(fill: luma(120))[#number]] #h(4pt) #text(fill: rgb("#c00000"), weight: "bold")[#corrected]
  ] else if number != "" [
    #number
  ] else [
    #text(fill: luma(150))[—]
  ]
}

#for child in data.children [
  #block(breakable: false, stroke: 0.5pt + black, inset: 8pt, width: 100%, radius: 2pt)[
    #text(size: 12pt, weight: "bold")[#child.name]
    #h(1fr)
    #checkbox(child.phone) #text(size: 9pt)[Téléphone]

    #v(0.2cm)

    #grid(
      columns: (auto, 1fr),
      gutter: 0.3cm,
      [*Numéro :*], [#phone_display(child.phone_number, child.phone_number_corrected)],
      [*Argent de poche :*], [#child.pocket_money €],
      [*Médicaments :*], [#list_or_dash(child.drugs)],
      [*Allergies :*], [#list_or_dash(child.allergies)],
      [*Maladies :*], [#list_or_dash(child.ilnesses)],
    )

    #if child.notes != "" [
      #v(0.2cm)
      *Notes :* #child.notes
    ]
  ]
  #v(0.3cm)
]
