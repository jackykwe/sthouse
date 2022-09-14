pub enum ElectricityReadingPerms {
    Create,
    Read,
    Update,
    Delete,
}

impl ToString for ElectricityReadingPerms {
    fn to_string(&self) -> String {
        match self {
            Self::Create => String::from("create:electricity-readings"),
            Self::Read => String::from("read:electricity-readings"),
            Self::Update => String::from("update:electricity-readings"),
            Self::Delete => String::from("delete:electricity-readings"),
        }
    }
}
