use derive_typst_intoval::{IntoDict, IntoValue};
use serde::{Deserialize, Serialize};
use typst::foundations::{Dict, IntoValue};
use typst_as_lib::TypstEngine;

static TEMPLATE_FILE: &str = include_str!("./templates/children_recap.typ");
static FONT: &[u8] = include_bytes!("./fonts/texgyrecursor-regular.otf");

#[derive(Debug, Clone, Serialize, Deserialize, IntoValue, IntoDict)]
#[serde(rename_all = "camelCase")]
pub struct Child {
    pub name: String,
    pub phone: bool,
    pub phone_number: String,
    pub phone_number_corrected: String,
    pub pocket_money: f64,
    pub drugs: Vec<String>,
    pub allergies: Vec<String>,
    pub ilnesses: Vec<String>,
    pub notes: String,
}

#[derive(Debug, Clone, IntoValue, IntoDict)]
struct ChildrenRecap {
    children: Vec<Child>,
}

impl From<ChildrenRecap> for Dict {
    fn from(value: ChildrenRecap) -> Self {
        value.into_dict()
    }
}

#[tauri::command]
pub fn generate_children_recap_pdf(children: Vec<Child>) -> Result<Vec<u8>, String> {
    let engine = TypstEngine::builder()
        .main_file(TEMPLATE_FILE)
        .fonts([FONT])
        .build();

    let doc = engine
        .compile_with_input(ChildrenRecap { children })
        .output
        .map_err(|err| format!("Échec de compilation du template Typst: {err:?}"))?;

    typst_pdf::pdf(&doc, &Default::default())
        .map_err(|err| format!("Échec de génération du PDF: {err:?}"))
}
