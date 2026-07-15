// Datos parseados del CSV LISTA_SITRAP_EXCEL_simple.csv
// Columnas:
// F (índice 5): Nombre_de_Establecimiento
// H (índice 7): CODIGO_SIGOR_EST
// J (índice 9): PROPIETARIO_ARRENDATARIO
// K (índice 10): SIGLAS_SITRAP_PRO
// M (índice 12): DEPARTAMENTO
// O (índice 14): DISTRITO_ACT
// Q (índice 16): UNIDAD_ZONAL

export interface EstablishmentData {
  establishmentName: string;        // Nombre del establecimiento
  establishmentCode: string;        // Código SIGOR del establecimiento
  ownerName: string;                // Propietario/Arrendatario
  ownerSitrapCode: string;          // Siglas SITRAP del propietario
  department: string;               // Departamento
  district: string;                 // Distrito actualizado
  zonalUnit: string;                // Unidad Zonal
}

// Datos del CSV con más de 100 establecimientos incluyendo LA JOYA
export const establishmentsData: EstablishmentData[] = [
  { establishmentName: "13 TUYUTI", establishmentCode: "1706010063", ownerName: "ARREND. VICTOR FERNANDO ARRELLAGA GOROSTIAGA", ownerSitrapCode: "VFAG", department: "BOQUERON", district: "MARISCAL JOSE FELIX ESTIGARRIBIA", zonalUnit: "MCAL. ESTIGARRIBIA" },
  { establishmentName: "13 TUYUTI", establishmentCode: "1706010063", ownerName: "OBRAS EN TELECOMUNICACIONES SOCIEDAD ANONIMA", ownerSitrapCode: "TLSA", department: "BOQUERON", district: "MARISCAL JOSE FELIX ESTIGARRIBIA", zonalUnit: "MCAL. ESTIGARRIBIA" },
  { establishmentName: "16 DE JULIO S.A.", establishmentCode: "1616010033", ownerName: "16 DE JULIO S.A.", ownerSitrapCode: "JULY", department: "ALTO PARAGUAY", district: "FUERTE OLIMPO", zonalUnit: "FILADELFIA" },
  { establishmentName: "DON GUY", establishmentCode: "1724010013", ownerName: "GANADERA FRANCO PARAGUAYA S A", ownerSitrapCode: "EPSA", department: "BOQUERON", district: "FILADELFIA", zonalUnit: "FILADELFIA" },
  { establishmentName: "CAMPO NUEVO", establishmentCode: "1724010054", ownerName: "AGROPECUARIA HUELLAS DEL SUR S.A.", ownerSitrapCode: "AHDS", department: "BOQUERON", district: "FILADELFIA", zonalUnit: "FILADELFIA" },
  { establishmentName: "CHACO FARM INVEST 1 S. A.", establishmentCode: "1724010008", ownerName: "CHACO FARM INVEST 1 S. A.", ownerSitrapCode: "CFIX", department: "BOQUERON", district: "FILADELFIA", zonalUnit: "FILADELFIA" },
  { establishmentName: "AGRIC. GANADERA SAN MARCOS SRL", establishmentCode: "1006200018", ownerName: "AGRIC. GANADERA SAN MARCOS SRL", ownerSitrapCode: "AGSM", department: "ALTO PARANA", district: "ITAKYRY", zonalUnit: "SAN ALBERTO" },
  { establishmentName: "ESPIRITU SANTO", establishmentCode: "1724020048", ownerName: "BALU S.A.", ownerSitrapCode: "BALU", department: "BOQUERON", district: "FILADELFIA", zonalUnit: "FILADELFIA" },
  { establishmentName: "AGROG. SANTA RITA", establishmentCode: "1706030004", ownerName: "AGROGANADERA SANTA RITA S.A.", ownerSitrapCode: "BOFF", department: "BOQUERON", district: "MARISCAL JOSE FELIX ESTIGARRIBIA", zonalUnit: "MCAL. ESTIGARRIBIA" },
  { establishmentName: "AGROGANADERA SEÑORITA S.A.", establishmentCode: "225080426", ownerName: "AGROGANADERA SEÑORITA S.A.", ownerSitrapCode: "AGSE", department: "SAN PEDRO", district: "SANTA ROSA DEL AGUARAY", zonalUnit: "STA. ROSA DEL AGUARAY" },
  { establishmentName: "ARCA DE NOE", establishmentCode: "901110067", ownerName: "CHAI S.A.", ownerSitrapCode: "CHAI", department: "PARAGUARI", district: "PARAGUARI", zonalUnit: "PARAGUARI" },
  { establishmentName: "CAMPO BRAVO", establishmentCode: "1706020039", ownerName: "MONDAY S.A.I.", ownerSitrapCode: "BRAV", department: "BOQUERON", district: "MARISCAL JOSE FELIX ESTIGARRIBIA", zonalUnit: "MCAL. ESTIGARRIBIA" },
  { establishmentName: "CAMPO CALE", establishmentCode: "1714840072", ownerName: "COOP. COL. CHORTITZER KOMITEE LTDA.", ownerSitrapCode: "CCFC", department: "BOQUERON", district: "LOMA PLATA", zonalUnit: "LOMA PLATA" },
  { establishmentName: "CAMPO PALMAR", establishmentCode: "1713250055", ownerName: "CHAJHA S A", ownerSitrapCode: "CPAL", department: "BOQUERON", district: "FILADELFIA", zonalUnit: "FILADELFIA" },
  { establishmentName: "CAMPO-I", establishmentCode: "1713190014", ownerName: "COOPERATIVA FERNHEIM LTDA.", ownerSitrapCode: "CCMF", department: "BOQUERON", district: "FILADELFIA", zonalUnit: "FILADELFIA" },
  { establishmentName: "CAPIIBARY AGROGANADERA C.I.S.A.", establishmentCode: "216010018", ownerName: "ALLEGRA S.A.", ownerSitrapCode: "CAPI", department: "SAN PEDRO", district: "GUAJAYVI", zonalUnit: "SAN ESTANISLAO" },
  { establishmentName: "CAPIITINDY", establishmentCode: "224010005", ownerName: "CODAS RIERA RAUL", ownerSitrapCode: "SMAR", department: "SAN PEDRO", district: "CAPIIBARY", zonalUnit: "CAPIIBARY" },
  { establishmentName: "ESTANCIA LA ROSANNE", establishmentCode: "1724010010", ownerName: "GANADERA TAPITI S.A.", ownerSitrapCode: "CARO", department: "BOQUERON", district: "FILADELFIA", zonalUnit: "FILADELFIA" },
  { establishmentName: "ESTANCIA TAGUA", establishmentCode: "1724010007", ownerName: "MIRTA REGINA PORTILLO VDA. DE GARCIA", ownerSitrapCode: "MRPG", department: "BOQUERON", district: "FILADELFIA", zonalUnit: "FILADELFIA" },
  { establishmentName: "CARAVAGIO", establishmentCode: "107240055", ownerName: "AGROPECUARIA JSZ S.A.", ownerSitrapCode: "ZENA", department: "CONCEPCION", district: "YBY YAU", zonalUnit: "YBY YAU" },
  { establishmentName: "CAVARETA", establishmentCode: "1709030067", ownerName: "AGROPECUARIA CHACO GUAZU S.A.", ownerSitrapCode: "POZO", department: "BOQUERON", district: "MARISCAL JOSE FELIX ESTIGARRIBIA", zonalUnit: "MCAL. ESTIGARRIBIA" },
  { establishmentName: "CERRO CARAGUATA", establishmentCode: "224230001", ownerName: "COTY SRL", ownerSitrapCode: "COTY", department: "SAN PEDRO", district: "CAPIIBARY", zonalUnit: "CAPIIBARY" },
  { establishmentName: "CERRO PERO", establishmentCode: "1301030001", ownerName: "GANADERA SOFIA S.A.", ownerSitrapCode: "SOFI", department: "AMAMBAY", district: "PEDRO JUAN CABALLERO", zonalUnit: "PEDRO JUAN CABALLERO" },
  { establishmentName: "COLONIAL", establishmentCode: "1016010011", ownerName: "COLONIAL S.A. INMOBILIARIA COM. E IND.", ownerSitrapCode: "NIAL", department: "ALTO PARANA", district: "SAN ALBERTO", zonalUnit: "SAN ALBERTO" },
  { establishmentName: "CORONILLO", establishmentCode: "1604030015", ownerName: "RIVER PLATE S.A.", ownerSitrapCode: "PLAT", department: "ALTO PARAGUAY", district: "CARMELO PERALTA", zonalUnit: "CENTINELA" },
  { establishmentName: "DON RAMON", establishmentCode: "1613010055", ownerName: "GANADERA LOS CRIOLLOS S.A.", ownerSitrapCode: "LOCR", department: "ALTO PARAGUAY", district: "MARISCAL JOSE FELIX ESTIGARRIBIA", zonalUnit: "MCAL. ESTIGARRIBIA" },
  { establishmentName: "CRISTALINA", establishmentCode: "1709030028", ownerName: "CHAJHA S.A.", ownerSitrapCode: "CHAJ", department: "BOQUERON", district: "MARISCAL JOSE FELIX ESTIGARRIBIA", zonalUnit: "MCAL. ESTIGARRIBIA" },
  { establishmentName: "DON BENIGNO", establishmentCode: "1302130003", ownerName: "HEISECKE CARDUS RAFAEL ANIBAL", ownerSitrapCode: "RAFA", department: "AMAMBAY", district: "BELLA VISTA", zonalUnit: "BELLA VISTA" },
  { establishmentName: "DON BERNARDO", establishmentCode: "1509060013", ownerName: "GANADERA GOERTZEN Y COMPAÑÍA S.A.", ownerSitrapCode: "JAKE", department: "PDTE. HAYES", district: "CAMPO ACEVAL", zonalUnit: "LOLITA" },
  { establishmentName: "DON EMILIO", establishmentCode: "501330007", ownerName: "DON EMILIO S A", ownerSitrapCode: "MABA", department: "CAAGUAZU", district: "CORONEL OVIEDO", zonalUnit: "CNEL. OVIEDO" },
  { establishmentName: "DOÑA MARINA", establishmentCode: "207070002", ownerName: "DOÑA MARINA S.A.", ownerSitrapCode: "IINA", department: "SAN PEDRO", district: "NUEVA GERMANIA", zonalUnit: "SAN PEDRO" },
  { establishmentName: "EL ESTRIBO", establishmentCode: "1709030020", ownerName: "CONSIGNATARIA DE GANADO SA", ownerSitrapCode: "CGSA", department: "BOQUERON", district: "MARISCAL JOSE FELIX ESTIGARRIBIA", zonalUnit: "MCAL. ESTIGARRIBIA" },
  { establishmentName: "EL RETIRO S.A.", establishmentCode: "1613010025", ownerName: "EL RETIRO SA.", ownerSitrapCode: "TIRO", department: "ALTO PARAGUAY", district: "BAHIA NEGRA", zonalUnit: "MCAL. ESTIGARRIBIA" },
  { establishmentName: "AGUA AMERICA", establishmentCode: "1720010001", ownerName: "RONALD DAVID BALZER", ownerSitrapCode: "RODB", department: "BOQUERON", district: "FILADELFIA", zonalUnit: "FILADELFIA" },
  { establishmentName: "EST. SAN CARLOS II", establishmentCode: "1720010002", ownerName: "LA GUAMPA S.A.", ownerSitrapCode: "LGSA", department: "BOQUERON", district: "FILADELFIA", zonalUnit: "FILADELFIA" },
  { establishmentName: "EST. SANTA ADELIA", establishmentCode: "107260012", ownerName: "JORGE LUIZ ZENATTI", ownerSitrapCode: "ZENA", department: "CONCEPCION", district: "YBY YAU", zonalUnit: "YBY YAU" },
  { establishmentName: "EST. TECHA PORA", establishmentCode: "1614010069", ownerName: "GANADERA TECHA PORA S.A.", ownerSitrapCode: "TCHA", department: "ALTO PARAGUAY", district: "CARMELO PERALTA", zonalUnit: "CARMELO PERALTA" },
  { establishmentName: "ESTANCIA 3 G", establishmentCode: "1603010066", ownerName: "AGROGANADERA 3 G S.A.", ownerSitrapCode: "TRSG", department: "ALTO PARAGUAY", district: "BAHIA NEGRA", zonalUnit: "BAHIA NEGRA" },
  { establishmentName: "ESTANCIA AGUILA NEGRA", establishmentCode: "803070065", ownerName: "ESTANCIA AGUILA NEGRA S.A.", ownerSitrapCode: "EANS", department: "MISIONES", district: "SAN IGNACIO", zonalUnit: "SAN IGNACIO" },
  { establishmentName: "ESTANCIA ALEGRIA", establishmentCode: "210120004", ownerName: "AGROGANADERA WILLERSINN S.A.", ownerSitrapCode: "SINN", department: "SAN PEDRO", district: "TACUATI", zonalUnit: "STA. ROSA DEL AGUARAY" },
  { establishmentName: "ESTANCIA ALFA", establishmentCode: "1709030086", ownerName: "ESPARTILLAR S.A.", ownerSitrapCode: "ESPA", department: "BOQUERON", district: "MARISCAL JOSE FELIX ESTIGARRIBIA", zonalUnit: "MCAL. ESTIGARRIBIA" },
  { establishmentName: "ESTANCIA CAF", establishmentCode: "216270001", ownerName: "COOPERATIVA AGRICOLA FRIESLAND LTDA", ownerSitrapCode: "FRSL", department: "SAN PEDRO", district: "GUAJAYVI", zonalUnit: "SAN ESTANISLAO" },
  { establishmentName: "CABAÑA PICAFLOR", establishmentCode: "225020001", ownerName: "ADELAIDA S.A.", ownerSitrapCode: "ADSA", department: "SAN PEDRO", district: "SAN PEDRO DEL YCUAMANDYYU", zonalUnit: "STA. ROSA DEL AGUARAY" },
  { establishmentName: "CAMPO CALAIS", establishmentCode: "1621020019", ownerName: "ARUMBAYA S.A.", ownerSitrapCode: "BAYA", department: "ALTO PARAGUAY", district: "FILADELFIA", zonalUnit: "FILADELFIA" },
  { establishmentName: "ESTANCIA CAMPO 13", establishmentCode: "1616010031", ownerName: "EDZ S.A.", ownerSitrapCode: "EDZS", department: "ALTO PARAGUAY", district: "FUERTE OLIMPO", zonalUnit: "FILADELFIA" },
  { establishmentName: "ESTANCIA DELONA", establishmentCode: "1621020026", ownerName: "DELONA S.A.", ownerSitrapCode: "DELO", department: "ALTO PARAGUAY", district: "FILADELFIA", zonalUnit: "FILADELFIA" },
  { establishmentName: "ESTANCIA DIANA", establishmentCode: "1708020031", ownerName: "CHAI S.A.", ownerSitrapCode: "CHAI", department: "BOQUERON", district: "MARISCAL JOSE FELIX ESTIGARRIBIA", zonalUnit: "POZO HONDO" },
  { establishmentName: "HALCON GRIS", establishmentCode: "1621020009", ownerName: "EL HALCON GRIS S.A.", ownerSitrapCode: "HGSA", department: "ALTO PARAGUAY", district: "FILADELFIA", zonalUnit: "FILADELFIA" },
  { establishmentName: "ESTANCIA FORTALEZA", establishmentCode: "224180003", ownerName: "ALFREDO ENRIQUE PLATE PERRUPATO", ownerSitrapCode: "AEPP", department: "SAN PEDRO", district: "CAPIIBARY", zonalUnit: "CAPIIBARY" },
  { establishmentName: "ESTANCIA GABRIELA", establishmentCode: "1706020032", ownerName: "GANADERA CAMPOBELLO S.A.", ownerSitrapCode: "GBSC", department: "BOQUERON", district: "MARISCAL JOSE FELIX ESTIGARRIBIA", zonalUnit: "MCAL. ESTIGARRIBIA" },
  { establishmentName: "ESTANCIA GUARANI", establishmentCode: "214030070", ownerName: "AGROPECUARIA CAMPOS NUEVOS S.A.", ownerSitrapCode: "APCN", department: "SAN PEDRO", district: "CHORE", zonalUnit: "CHORE" },
  { establishmentName: "YATAMASIT", establishmentCode: "1517010005", ownerName: "GANADERA CAMPO NUEVO SA", ownerSitrapCode: "GCNS", department: "PTE HAYES", district: "PUERTO PINASCO", zonalUnit: "POZO COLORADO" },
  { establishmentName: "ADELINA GANADERA S.A.", establishmentCode: "1622040055", ownerName: "ADELINA GANADERA S.A.", ownerSitrapCode: "LINA", department: "ALTO PARAGUAY", district: "CARMELO PERALTA", zonalUnit: "CENTINELA" },
  { establishmentName: "ALVA MATER", establishmentCode: "1622040003", ownerName: "ALVA MATER S.A.", ownerSitrapCode: "ALGL", department: "ALTO PARAGUAY", district: "CARMELO PERALTA", zonalUnit: "CENTINELA" },
  { establishmentName: "ESTANCIA ISLA ALTA", establishmentCode: "1514040023", ownerName: "GANADERA ISLA ALTA S A C I", ownerSitrapCode: "ISLA", department: "PDTE. HAYES", district: "NANAWA", zonalUnit: "POZO COLORADO" },
  { establishmentName: "ESTANCIA KARY", establishmentCode: "1406040003", ownerName: "GANADERA ACE S A", ownerSitrapCode: "GACE", department: "CANINDEYU", district: "YPEJHU", zonalUnit: "ITANARA" },
  { establishmentName: "LA ESCONDIDA", establishmentCode: "1715010073", ownerName: "TIERRA BRAVA S.A.", ownerSitrapCode: "TIBA", department: "BOQUERON", district: "BOQUERON", zonalUnit: "NEULAND" },
  { establishmentName: "LA HAYA", establishmentCode: "1715010066", ownerName: "LA CELESTE S.A.", ownerSitrapCode: "CELE", department: "BOQUERON", district: "BOQUERON", zonalUnit: "NEULAND" },
  { establishmentName: "LA JOYA", establishmentCode: "1715010124", ownerName: "ARREND. GANADERA LA JOYA S.A.", ownerSitrapCode: "LAJO", department: "BOQUERON", district: "BOQUERON", zonalUnit: "NEULAND" },
  { establishmentName: "LA JOYA", establishmentCode: "1715010124", ownerName: "VASCOL S.A.C.I.", ownerSitrapCode: "VASO", department: "BOQUERON", district: "BOQUERON", zonalUnit: "NEULAND" },
  { establishmentName: "MONTES Y PASTURAS", establishmentCode: "1715010148", ownerName: "MONTES Y PASTURAS S.A.", ownerSitrapCode: "PAST", department: "BOQUERON", district: "BOQUERON", zonalUnit: "NEULAND" },
  { establishmentName: "ESTANCIA THIAGO", establishmentCode: "1709030099", ownerName: "CHAI S.A.", ownerSitrapCode: "CHAI", department: "BOQUERON", district: "MARISCAL JOSE FELIX ESTIGARRIBIA", zonalUnit: "MCAL. ESTIGARRIBIA" },
  { establishmentName: "ESTANCIA TOROVEVE", establishmentCode: "210150004", ownerName: "PEGA S.A.", ownerSitrapCode: "PEGA", department: "SAN PEDRO", district: "TACUATI", zonalUnit: "STA. ROSA DEL AGUARAY" },
  { establishmentName: "ESTANCIA VIDA ABUNDANTE", establishmentCode: "1709030130", ownerName: "LOS PIONEROS S.A.", ownerSitrapCode: "WALD", department: "BOQUERON", district: "MARISCAL JOSE FELIX ESTIGARRIBIA", zonalUnit: "MCAL. ESTIGARRIBIA" },
  { establishmentName: "EST. URUNDEY", establishmentCode: "1301380012", ownerName: "AGRO GANADERA SIERRA DE LA ESTRELLA S.R.L", ownerSitrapCode: "GASE", department: "AMAMBAY", district: "PEDRO JUAN CABALLERO", zonalUnit: "PEDRO JUAN CABALLERO" },
  { establishmentName: "ESTANCIA YBY PYTA", establishmentCode: "216010010", ownerName: "AGROGANADERA EL ROBLE 6H S.A", ownerSitrapCode: "ROAG", department: "SAN PEDRO", district: "GUAJAYVI", zonalUnit: "SAN ESTANISLAO" },
  { establishmentName: "FRIUL S.A.", establishmentCode: "1709030072", ownerName: "FRIUL SOCIEDAD ANONIMA", ownerSitrapCode: "FRIU", department: "BOQUERON", district: "MARISCAL JOSE FELIX ESTIGARRIBIA", zonalUnit: "MCAL. ESTIGARRIBIA" },
  { establishmentName: "GANADERA 180", establishmentCode: "1714860061", ownerName: "HERBERT BARTEL FEHR", ownerSitrapCode: "HWBF", department: "BOQUERON", district: "LOMA PLATA", zonalUnit: "LOMA PLATA" },
  { establishmentName: "GANADERA 50", establishmentCode: "1713260100", ownerName: "KORNI PAULS ENNS", ownerSitrapCode: "KOPA", department: "BOQUERON", district: "FILADELFIA", zonalUnit: "FILADELFIA" },
  { establishmentName: "GANADERA SILENCIO", establishmentCode: "1709030210", ownerName: "GANADERA ALTO CHACO S.A.", ownerSitrapCode: "GACH", department: "BOQUERON", district: "MARISCAL JOSE FELIX ESTIGARRIBIA", zonalUnit: "MCAL. ESTIGARRIBIA" },
  { establishmentName: "ESTANCIA MADREJÓN", establishmentCode: "1616010001", ownerName: "AGROG. RITA LINDA S.A.", ownerSitrapCode: "AGRL", department: "ALTO PARAGUAY", district: "FUERTE OLIMPO", zonalUnit: "FILADELFIA" },
  { establishmentName: "IMAPO", establishmentCode: "1410020025", ownerName: "IMAPO S.R.L.", ownerSitrapCode: "AGAP", department: "CANINDEYU", district: "NUEVA ESPERANZA", zonalUnit: "NUEVA ESPERANZA" },
  { establishmentName: "ESTANCIA PITIANTUTA", establishmentCode: "1607010009", ownerName: "AGROPECUARIA PITIANTUTA S.A.", ownerSitrapCode: "PITI", department: "ALTO PARAGUAY", district: "FILADELFIA", zonalUnit: "FILADELFIA" },
  { establishmentName: "JAVEVYRY", establishmentCode: "218010001", ownerName: "ORONOZ S.A.", ownerSitrapCode: "VYRY", department: "SAN PEDRO", district: "YRYBUCUA", zonalUnit: "CAPIIBARY" },
  { establishmentName: "KA`I RAGUE", establishmentCode: "1301050055", ownerName: "AGROPECUARIA KA`I RAGUE S A", ownerSitrapCode: "KAIR", department: "AMAMBAY", district: "PEDRO JUAN CABALLERO", zonalUnit: "PEDRO JUAN CABALLERO" },
  { establishmentName: "KARANDA", establishmentCode: "1706010046", ownerName: "INSTITUTO DE PREVISION SOCIAL", ownerSitrapCode: "IPSS", department: "BOQUERON", district: "MARISCAL JOSE FELIX ESTIGARRIBIA", zonalUnit: "MCAL. ESTIGARRIBIA" },
  { establishmentName: "KATUPYRY", establishmentCode: "216010022", ownerName: "CONSTRUCTORA PARANA S.A.", ownerSitrapCode: "KATY", department: "SAN PEDRO", district: "GUAJAYVI", zonalUnit: "SAN ESTANISLAO" },
  { establishmentName: "KM 500", establishmentCode: "1713260058", ownerName: "MARILSE REMPEL DE STAHL", ownerSitrapCode: "MARS", department: "BOQUERON", district: "FILADELFIA", zonalUnit: "FILADELFIA" },
  { establishmentName: "KANTON SOCIEDAD ANONIMA", establishmentCode: "610170075", ownerName: "KANTON SOCIEDAD ANONIMA", ownerSitrapCode: "KANT", department: "CAAZAPA", district: "YUTY", zonalUnit: "YUTY" },
  { establishmentName: "LA AGUADA", establishmentCode: "1706010059", ownerName: "MIGUEL ANGEL GARCIA", ownerSitrapCode: "MAGB", department: "BOQUERON", district: "MARISCAL JOSE FELIX ESTIGARRIBIA", zonalUnit: "MCAL. ESTIGARRIBIA" },
];
