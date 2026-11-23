export const SEED_MODULES = [
  // ========================
  // 1. VOCABULARIO & FLASHCARDS (Programación, Bases de Datos, Web, Git, Scrum, DevOps)
  // ========================
  {
    category: 'vocabulary',
    domain_area: 'Web Development',
    title: 'Throughput & Latency',
    topic: 'Rendimiento de Sistemas',
    cefr_level: 'B2',
    track: 'Full-Stack',
    prompt: 'Explica en inglés qué es "throughput" en una API REST y en qué se diferencia de "latency".',
    scenario_context: 'En una junta técnica, el Tech Lead pregunta cuántas peticiones por segundo soporta la API de pagos vs cuánto tarda cada respuesta.',
    spanish_hint: 'Throughput = cantidad de peticiones procesadas por segundo. Latency = tiempo que tarda una sola petición en ir y volver.',
    expected_pattern: 'Throughput represents the number of requests processed per second, whereas latency measures the round-trip time required to service a single request.',
    keywords: 'throughput, requests, second, latency, round-trip, time',
    grammar_target: 'Sustantivos técnicos compuestos',
    options_json: JSON.stringify({
      term: 'Throughput',
      spanishTranslation: 'Rendimiento / Capacidad de procesamiento',
      phonetic: '/ˈθruː.pʊt/',
      partOfSpeech: 'sustantivo',
      shortDefinition: 'The volume of requests or data processed by a system per unit of time.',
      spanishDefinition: 'Cantidad de peticiones o datos que un sistema procesa por segundo (ej. 1,500 req/s).',
      example: 'After adding Redis caching, API throughput increased from 400 to 1,800 requests per second.',
      exampleEs: 'Después de agregar caché con Redis, el rendimiento de la API subió de 400 a 1,800 peticiones por segundo.'
    }),
    time_limit_sec: 90
  },
  {
    category: 'vocabulary',
    domain_area: 'Web Development',
    title: 'Middleware Pipeline',
    topic: 'Arquitectura Express y APIs',
    cefr_level: 'B1+',
    track: 'Full-Stack',
    prompt: 'Explica en inglés qué hace un "middleware" antes de que una petición llegue al controlador.',
    scenario_context: 'Un compañero nuevo pregunta por qué no validamos el token JWT dentro de cada ruta por separado.',
    spanish_hint: 'Usa palabras como: middleware, intercepts, authenticate, validate, controller.',
    expected_pattern: 'Middleware intercepts incoming HTTP requests to authenticate tokens and validate payloads before passing control to the controller.',
    keywords: 'middleware, intercepts, incoming, authenticate, validate, controller',
    grammar_target: 'Cláusulas de propósito (to + verbo)',
    options_json: JSON.stringify({
      term: 'Middleware',
      spanishTranslation: 'Capa intermedia / Filtro de peticiones',
      phonetic: '/ˈmɪd.əl.weər/',
      partOfSpeech: 'sustantivo',
      shortDefinition: 'Software layer that inspects, transforms, or authenticates requests between the server and route handlers.',
      spanishDefinition: 'Función intermedia que revisa, autentica o transforma una petición HTTP antes de llegar al controlador final.',
      example: 'The JWT middleware rejects unauthorized tokens before the database query is executed.',
      exampleEs: 'El middleware JWT rechaza tokens no autorizados antes de que se ejecute la consulta en base de datos.'
    }),
    time_limit_sec: 90
  },
  {
    category: 'vocabulary',
    domain_area: 'Web Development',
    title: 'Idempotency in REST APIs',
    topic: 'Confiabilidad de APIs',
    cefr_level: 'B2',
    track: 'Full-Stack',
    prompt: 'Explica en inglés por qué un endpoint PUT o DELETE debe ser "idempotent".',
    scenario_context: 'La app móvil reintenta automáticamente una petición cuando falla el Wi-Fi; no queremos cobrar dos veces.',
    spanish_hint: 'Idempotency = ejecutar la misma operación varias veces produce exactamente el mismo resultado.',
    expected_pattern: 'An idempotent operation produces the same server state regardless of how many times the identical request is retried.',
    keywords: 'idempotent, same, state, retried, identical, request',
    grammar_target: 'Conectores de condición',
    options_json: JSON.stringify({
      term: 'Idempotency',
      spanishTranslation: 'Idempotencia (mismo efecto al repetir)',
      phonetic: '/ˌaɪ.dɛmˈpoʊ.tən.si/',
      partOfSpeech: 'sustantivo',
      shortDefinition: 'Property ensuring repeated identical requests have the same effect as a single request.',
      spanishDefinition: 'Propiedad que garantiza que repetir la misma petición varias veces no genere efectos duplicados.',
      example: 'Payment endpoints use an idempotency key so network retries do not charge the customer twice.',
      exampleEs: 'Los endpoints de pago usan una clave de idempotencia para que los reintentos de red no cobren doble al cliente.'
    }),
    time_limit_sec: 90
  },
  {
    category: 'vocabulary',
    domain_area: 'Programming',
    title: 'Codebase Decoupling',
    topic: 'Arquitectura de Software',
    cefr_level: 'B2',
    track: 'All',
    prompt: 'Describe en inglés el beneficio principal de "decoupling" (desacoplar) módulos en un proyecto.',
    scenario_context: 'Tu equipo planea separar la lógica de negocio de los componentes visuales de React.',
    spanish_hint: 'Decoupling = reducir dependencias directas para probar y desplegar cada módulo por separado.',
    expected_pattern: 'Decoupling a codebase reduces direct dependencies between modules, making components easier to test and deploy independently.',
    keywords: 'decoupling, codebase, dependencies, modules, test, independently',
    grammar_target: 'Gerundios como sujeto',
    options_json: JSON.stringify({
      term: 'Codebase Decoupling',
      spanishTranslation: 'Desacoplamiento del código base',
      phonetic: '/ˈkoʊd.beɪs diːˈkʌp.lɪŋ/',
      partOfSpeech: 'frase nominal',
      shortDefinition: 'Separating software modules so changes in one area do not break unrelated components.',
      spanishDefinition: 'Separar módulos del código para que cambiar una parte no rompa otras funciones independientes.',
      example: 'Decoupling the notification service allowed us to swap email providers in one afternoon.',
      exampleEs: 'Desacoplar el servicio de notificaciones nos permitió cambiar de proveedor de correo en una tarde.'
    }),
    time_limit_sec: 90
  },
  {
    category: 'vocabulary',
    domain_area: 'Programming',
    title: 'Technical Debt & Refactoring',
    topic: 'Calidad de Código',
    cefr_level: 'B1+',
    track: 'All',
    prompt: 'Explica en inglés qué significa "refactoring" y cómo reduce la deuda técnica sin cambiar el comportamiento.',
    scenario_context: 'El Product Owner pregunta por qué dedicamos dos días del sprint a limpiar código antiguo.',
    spanish_hint: 'Usa "without altering" o "without changing" para indicar que funciona igual por fuera.',
    expected_pattern: 'Refactoring restructures existing source code to improve readability and reduce technical debt without altering its external behavior.',
    keywords: 'refactoring, restructures, readability, technical debt, behavior',
    grammar_target: 'Gerundio después de preposición',
    options_json: JSON.stringify({
      term: 'Refactoring',
      spanishTranslation: 'Refactorización de código',
      phonetic: '/riːˈfæk.tər.ɪŋ/',
      partOfSpeech: 'sustantivo',
      shortDefinition: 'Improving internal code structure and clarity while preserving identical external outputs.',
      spanishDefinition: 'Mejorar la estructura interna y legibilidad del código manteniendo exactamente el mismo resultado externo.',
      example: 'We scheduled two days for refactoring legacy validation helpers before adding new rules.',
      exampleEs: 'Programamos dos días para refactorizar los validadores antiguos antes de agregar nuevas reglas.'
    }),
    time_limit_sec: 90
  },
  {
    category: 'vocabulary',
    domain_area: 'Databases',
    title: 'Database Deadlock',
    topic: 'Concurrencia y SQL Server',
    cefr_level: 'B2',
    track: 'Full-Stack',
    prompt: 'Explica en inglés qué es un "deadlock" entre dos transacciones en SQL Server.',
    scenario_context: 'Apareció el error 1205 en producción y debes explicárselo al equipo en inglés.',
    spanish_hint: 'Deadlock = dos transacciones esperan mutuamente bloqueos que tiene la otra.',
    expected_pattern: 'A deadlock occurs when two concurrent transactions mutually wait for locks held by each other, preventing either transaction from completing.',
    keywords: 'deadlock, concurrent, transactions, locks, waiting, completing',
    grammar_target: 'Cláusulas temporales (when...)',
    options_json: JSON.stringify({
      term: 'Deadlock',
      spanishTranslation: 'Interbloqueo de transacciones',
      phonetic: '/ˈdɛd.lɒk/',
      partOfSpeech: 'sustantivo',
      shortDefinition: 'A concurrency stalemate where two transactions wait indefinitely for each other to release locks.',
      spanishDefinition: 'Bloqueo mutuo donde dos transacciones esperan indefinidamente a que la otra libere un registro.',
      example: 'The deadlock was resolved after both queries were ordered to lock tables in the same sequence.',
      exampleEs: 'El interbloqueo se resolvió después de ordenar ambas consultas para bloquear tablas en la misma secuencia.'
    }),
    time_limit_sec: 90
  },
  {
    category: 'vocabulary',
    domain_area: 'Databases',
    title: 'Referential Integrity',
    topic: 'Diseño Relacional SQL',
    cefr_level: 'B1+',
    track: 'All',
    prompt: 'Define en inglés "referential integrity" usando llaves primarias y foráneas.',
    scenario_context: 'En un Code Review explicas por qué agregaste FOREIGN KEY en la tabla ExerciseScores.',
    spanish_hint: 'Referential integrity = asegura que toda llave foránea apunte a una llave primaria válida.',
    expected_pattern: 'Referential integrity guarantees that every foreign key value corresponds to an existing primary key, preventing orphaned records.',
    keywords: 'referential integrity, foreign key, primary key, orphaned, records',
    grammar_target: 'Verbos de garantía',
    options_json: JSON.stringify({
      term: 'Referential Integrity',
      spanishTranslation: 'Integridad referencial',
      phonetic: '/ˌrɛf.əˈrɛn.ʃəl ɪnˈtɛɡ.rɪ.ti/',
      partOfSpeech: 'frase nominal',
      shortDefinition: 'Database rule ensuring relationships between foreign and primary keys stay valid and consistent.',
      spanishDefinition: 'Regla de base de datos que garantiza que las relaciones entre llaves primarias y foráneas nunca queden rotas.',
      example: 'Foreign keys preserve referential integrity so scores cannot exist without a valid user.',
      exampleEs: 'Las llaves foráneas preservan la integridad referencial para que no existan puntajes sin un usuario válido.'
    }),
    time_limit_sec: 90
  },
  {
    category: 'vocabulary',
    domain_area: 'Git & Version Control',
    title: 'Merge Conflict Resolution',
    topic: 'Flujos Colaborativos en Git',
    cefr_level: 'B1',
    track: 'All',
    prompt: 'Explica en inglés cuándo ocurre un "merge conflict" en Git y cómo se resuelve.',
    scenario_context: 'Dos desarrolladores editaron las mismas líneas en ramas distintas.',
    spanish_hint: 'Merge conflict = dos ramas modificaron las mismas líneas y el desarrollador debe elegir qué cambios conservar.',
    expected_pattern: 'A merge conflict occurs when two branches modify the same lines of a file, requiring the developer to review and keep the intended changes.',
    keywords: 'merge conflict, branches, same lines, file, review, changes',
    grammar_target: 'Presente simple para procesos',
    options_json: JSON.stringify({
      term: 'Merge Conflict',
      spanishTranslation: 'Conflicto de fusión en Git',
      phonetic: '/mɜːrdʒ ˈkɒn.flɪkt/',
      partOfSpeech: 'frase nominal',
      shortDefinition: 'Situation where Git cannot automatically combine competing edits on the same code lines.',
      spanishDefinition: 'Situación en la que Git no puede unir automáticamente dos cambios distintos en las mismas líneas.',
      example: 'The merge conflict in routes.js was resolved before the pull request was approved.',
      exampleEs: 'El conflicto de fusión en routes.js fue resuelto antes de aprobar el pull request.'
    }),
    time_limit_sec: 90
  },
  {
    category: 'vocabulary',
    domain_area: 'Git & Version Control',
    title: 'Git Rebase vs Merge',
    topic: 'Historial Limpio de Commits',
    cefr_level: 'B2',
    track: 'DevOps',
    prompt: 'Compara en inglés "git rebase" frente a "git merge" al actualizar una rama.',
    scenario_context: 'Tu líder técnico prefiere un historial lineal de commits en el repositorio.',
    spanish_hint: 'Usa "whereas" para contrastar: rebase crea historial lineal, merge crea un commit de unión.',
    expected_pattern: 'Git rebase replays feature commits on top of the latest main branch for a linear history, whereas merge creates a new merge commit.',
    keywords: 'rebase, linear, history, commits, merge, branch',
    grammar_target: 'Conectores de contraste (whereas)',
    options_json: JSON.stringify({
      term: 'Git Rebase',
      spanishTranslation: 'Reorganización de commits sobre rama base',
      phonetic: '/ɡɪt riːˈbeɪs/',
      partOfSpeech: 'sustantivo / verbo',
      shortDefinition: 'Reapplying commits from one branch onto another base commit to keep history clean and linear.',
      spanishDefinition: 'Volver a aplicar tus commits encima de la versión más reciente de main para mantener un historial lineal.',
      example: 'Always rebase your local feature branch onto main before opening a pull request.',
      exampleEs: 'Siempre haz rebase de tu rama local sobre main antes de abrir un pull request.'
    }),
    time_limit_sec: 90
  },
  {
    category: 'vocabulary',
    domain_area: 'Agile & Scrum',
    title: 'Sprint Blocker / Impediment',
    topic: 'Comunicación en Daily Standup',
    cefr_level: 'B1',
    track: 'All',
    prompt: 'Explica en inglés qué es un "blocker" durante una reunión Daily Standup.',
    scenario_context: 'No puedes probar el webhook de pagos porque aún no tienes credenciales de staging.',
    spanish_hint: 'Blocker = dependencia externa o impedimento técnico que detiene tu avance.',
    expected_pattern: 'A blocker is an external dependency or technical impediment preventing progress, such as waiting for staging credentials from DevOps.',
    keywords: 'blocker, dependency, impediment, progress, waiting',
    grammar_target: 'Registro profesional en Scrum',
    options_json: JSON.stringify({
      term: 'Blocker (Impediment)',
      spanishTranslation: 'Bloqueo o impedimento técnico',
      phonetic: '/ˈblɒk.ər/',
      partOfSpeech: 'sustantivo',
      shortDefinition: 'An obstacle or unmet dependency that stops a developer from completing a sprint task.',
      spanishDefinition: 'Obstáculo o dependencia faltante que impide a un desarrollador continuar con su tarea del sprint.',
      example: 'My only blocker today is that the staging SQL Server port is still restricted.',
      exampleEs: 'Mi único bloqueo hoy es que el puerto de SQL Server en staging sigue restringido.'
    }),
    time_limit_sec: 90
  },
  {
    category: 'vocabulary',
    domain_area: 'Agile & Scrum',
    title: 'Regression Testing',
    topic: 'QA y Calidad de Entregas',
    cefr_level: 'B1+',
    track: 'QA',
    prompt: 'Explica en inglés para qué sirve "regression testing" antes de salir a producción.',
    scenario_context: 'Se fusionó un cambio urgente y QA debe validar que nada anterior se haya roto.',
    spanish_hint: 'Regression testing = comprobar que cambios nuevos no dañaron funciones existentes.',
    expected_pattern: 'Regression testing verifies that recent code changes or bug fixes have not broken existing application functionality.',
    keywords: 'regression testing, verifies, changes, broken, existing, functionality',
    grammar_target: 'Presente perfecto negativo',
    options_json: JSON.stringify({
      term: 'Regression Testing',
      spanishTranslation: 'Pruebas de regresión',
      phonetic: '/rɪˈɡrɛʃ.ən ˈtɛs.tɪŋ/',
      partOfSpeech: 'frase nominal',
      shortDefinition: 'Re-running tests after code edits to confirm previously working features still operate properly.',
      spanishDefinition: 'Volver a ejecutar pruebas tras modificar código para confirmar que lo que ya funcionaba sigue estable.',
      example: 'Automated regression testing caught a broken login redirect before deployment.',
      exampleEs: 'Las pruebas de regresión automatizadas detectaron una redirección rota en el login antes del despliegue.'
    }),
    time_limit_sec: 90
  },
  {
    category: 'vocabulary',
    domain_area: 'DevOps',
    title: 'Rollback Strategy',
    topic: 'Pipelines CI/CD',
    cefr_level: 'B2',
    track: 'DevOps',
    prompt: 'Explica en inglés por qué es vital tener un "rollback" automático en CI/CD.',
    scenario_context: 'Tras un despliegue nuevo aparecen errores HTTP 500 en producción.',
    spanish_hint: 'Rollback = regresar automáticamente a la última versión estable si fallan los health checks.',
    expected_pattern: 'An automated rollback reverts production back to the last stable release if health checks fail after deployment.',
    keywords: 'rollback, reverts, stable, release, health checks, deployment',
    grammar_target: 'Primera condicional',
    options_json: JSON.stringify({
      term: 'Rollback',
      spanishTranslation: 'Reversión a versión estable anterior',
      phonetic: '/ˈroʊl.bæk/',
      partOfSpeech: 'sustantivo',
      shortDefinition: 'Restoring software or database state to a previous stable version after a failed change.',
      spanishDefinition: 'Restaurar la aplicación o base de datos a su última versión estable tras un cambio fallido.',
      example: 'If smoke tests fail in production, the pipeline triggers an automatic rollback within 30 seconds.',
      exampleEs: 'Si las pruebas rápidas fallan en producción, el pipeline dispara un rollback automático en 30 segundos.'
    }),
    time_limit_sec: 90
  },

  // ========================
  // 2. CUESTIONARIOS DE GRAMÁTICA (Opción Múltiple)
  // ========================
  {
    category: 'grammar_quiz',
    domain_area: 'DevOps',
    title: 'Voz Pasiva en Reportes de Incidentes',
    topic: 'Technical Passive Voice',
    cefr_level: 'B1+',
    track: 'All',
    prompt: 'Elige la oración más objetiva y profesional usando voz pasiva para un reporte post-mortem.',
    scenario_context: 'Estás redactando un reporte formal (RCA) para gerentes internacionales.',
    spanish_hint: 'Evita "We" o "I". Usa: objeto + was/were + verbo en participio (ej. "was restarted").',
    expected_pattern: 'The server was restarted after the memory leak was identified.',
    keywords: 'was restarted, was identified',
    grammar_target: 'Voz Pasiva Técnica',
    options_json: JSON.stringify({
      question: 'Selecciona la mejor oración técnica para un reporte de incidente (RCA):',
      choices: [
        'We restarted the server because I found a memory leak.',
        'The server was restarted after the memory leak was identified.',
        'The server restarted itself after the leak identifying.',
        'Someone did restart the server when the leak was find.'
      ],
      correctIndex: 1,
      explanation: '¡Correcto! La voz pasiva ("was restarted... was identified") suena objetiva y profesional porque se enfoca en el sistema y no en culpar personas.'
    }),
    time_limit_sec: 60
  },
  {
    category: 'grammar_quiz',
    domain_area: 'Programming',
    title: 'Primera Condicional en Lógica de Sistemas',
    topic: 'Condicionales (If-clauses)',
    cefr_level: 'B1',
    track: 'All',
    prompt: 'Selecciona la oración que usa correctamente la Primera Condicional sin poner "will" después de "if".',
    scenario_context: 'Documentando reglas automáticas de alertas en el repositorio.',
    spanish_hint: 'Regla de oro: después de "If" va Presente Simple. El "will" va solo en la segunda parte.',
    expected_pattern: 'If the container exceeds the memory limit, Kubernetes will restart the pod.',
    keywords: 'exceeds, will restart',
    grammar_target: 'Primera Condicional',
    options_json: JSON.stringify({
      question: '¿Cuál oración describe correctamente una condición real del sistema?',
      choices: [
        'If the container will exceed the memory limit, Kubernetes restarts the pod.',
        'If the container exceeds the memory limit, Kubernetes will restart the pod.',
        'If the container exceeded the memory limit, Kubernetes will restart the pod.',
        'If the container exceeding the memory limit, Kubernetes would restart.'
      ],
      correctIndex: 1,
      explanation: 'En la Primera Condicional, la cláusula con "if" siempre usa Presente Simple ("exceeds") y el resultado usa "will + verbo" ("will restart"). Nunca uses "will" justo después de "if".'
    }),
    time_limit_sec: 60
  },
  {
    category: 'grammar_quiz',
    domain_area: 'Git & Version Control',
    title: 'Verbos Modales Corteses en Code Reviews',
    topic: 'Etiqueta en Pull Requests',
    cefr_level: 'B2',
    track: 'All',
    prompt: 'Elige el comentario más constructivo y respetuoso para pedir un cambio en un Pull Request.',
    scenario_context: 'Un compañero escribió un ciclo anidado lento O(n²) en un endpoint.',
    spanish_hint: 'En inglés profesional se usan modales suaves ("Could we...", "You might want to...") en vez de órdenes.',
    expected_pattern: 'Could we extract this lookup into a Map to reduce time complexity?',
    keywords: 'could, extract, map',
    grammar_target: 'Verbos Modales en Code Review',
    options_json: JSON.stringify({
      question: '¿Cómo sugerirías refactorizar un ciclo lento en un Pull Request de GitHub?',
      choices: [
        'Change this immediately. Never write nested loops like this.',
        'You must fix this bad code before I approve anything.',
        'Could we extract this lookup into a Map to reduce time complexity?',
        'Why did you write this? Rewrite it now.'
      ],
      correctIndex: 2,
      explanation: 'Usar "Could we..." convierte una crítica en una propuesta colaborativa. Es el estándar en equipos de ingeniería internacionales.'
    }),
    time_limit_sec: 60
  },
  {
    category: 'grammar_quiz',
    domain_area: 'Databases',
    title: 'Segunda Condicional para Arquitectura',
    topic: 'Escenarios Hipotéticos',
    cefr_level: 'B2',
    track: 'Full-Stack',
    prompt: 'Elige la Segunda Condicional correcta para hablar de un escenario hipotético de tráfico.',
    scenario_context: 'En una entrevista te preguntan qué harías si el tráfico creciera 10 veces.',
    spanish_hint: 'Segunda Condicional (hipótesis): If + Pasado Simple, ... would + verbo base.',
    expected_pattern: 'If traffic increased tenfold, we would add read replicas to SQL Server.',
    keywords: 'increased, would add',
    grammar_target: 'Segunda Condicional',
    options_json: JSON.stringify({
      question: '¿Qué oración expresa correctamente un escenario hipotético de escalabilidad?',
      choices: [
        'If traffic increased tenfold, we would add read replicas to SQL Server.',
        'If traffic increases tenfold, we would added read replicas.',
        'If traffic would increase tenfold, we added read replicas.',
        'If traffic increase tenfold, we will would add replicas.'
      ],
      correctIndex: 0,
      explanation: 'La Segunda Condicional combina Pasado Simple en la condición ("increased") con "would + verbo base" ("would add") para expresar situaciones hipotéticas.'
    }),
    time_limit_sec: 60
  },
  {
    category: 'grammar_quiz',
    domain_area: 'Agile & Scrum',
    title: 'Tiempos Verbales en el Daily Standup',
    topic: 'Ayer / Hoy / Bloqueos',
    cefr_level: 'B1',
    track: 'All',
    prompt: 'Elige la frase con los tiempos correctos para reportar lo de ayer y lo de hoy.',
    scenario_context: 'Tu turno de hablar en el Daily Standup de las 9:00 AM.',
    spanish_hint: 'Ayer ("Yesterday") va en Pasado Simple ("resolved"). Hoy ("Today") en Presente Continuo ("am writing").',
    expected_pattern: 'Yesterday I resolved the CORS issue, and today I am writing integration tests.',
    keywords: 'resolved, writing',
    grammar_target: 'Pasado Simple vs Presente Continuo',
    options_json: JSON.stringify({
      question: '¿Cuál reporte de Daily Standup es claro y gramaticalmente correcto?',
      choices: [
        'Yesterday I resolve the CORS issue and today I write tests.',
        'Yesterday I resolved the CORS issue, and today I am writing integration tests.',
        'Yesterday I was resolve the CORS issue and today I will writing tests.',
        'Yesterday I have resolving the CORS issue, today I wrote tests.'
      ],
      correctIndex: 1,
      explanation: 'Para acciones terminadas ayer usa Pasado Simple ("resolved"), y para el trabajo en curso hoy usa Presente Continuo ("am writing").'
    }),
    time_limit_sec: 60
  },

  // ========================
  // 3. COMPLETAR ORACIONES (Fill-in-the-Blanks)
  // ========================
  {
    category: 'fill_blank',
    domain_area: 'DevOps',
    title: 'Completar: Voz Pasiva en Despliegue',
    topic: 'Voz Pasiva',
    cefr_level: 'B1+',
    track: 'DevOps',
    prompt: 'Escribe la forma pasiva en pasado del verbo "deploy" para completar el reporte.',
    scenario_context: 'Bitácora de liberación a producción tras pasar pruebas QA.',
    spanish_hint: 'Sujeto singular ("the hotfix") + was + participio pasado de deploy.',
    expected_pattern: 'was deployed',
    keywords: 'was deployed',
    grammar_target: 'Voz Pasiva Técnica',
    options_json: JSON.stringify({
      sentenceBefore: 'After the QA smoke tests passed, the hotfix',
      sentenceAfter: 'to production without downtime.',
      hintVerb: 'deploy (pasiva en pasado)',
      chips: ['was deployed', 'were deployed', 'deployed'],
      acceptedAnswers: ['was deployed', 'was rolled out'],
      explanation: 'Como "the hotfix" es singular y la acción ya ocurrió en pasado, se usa voz pasiva: "was deployed".'
    }),
    time_limit_sec: 60
  },
  {
    category: 'fill_blank',
    domain_area: 'Databases',
    title: 'Completar: Primera Condicional en SQL',
    topic: 'Primera Condicional',
    cefr_level: 'B1',
    track: 'Full-Stack',
    prompt: 'Completa la cláusula "If" en Presente Simple (recuerda: no uses "will").',
    scenario_context: 'Especificación de rollback automático en transacciones SQL.',
    spanish_hint: 'Tercera persona singular en presente simple: fail → fails.',
    expected_pattern: 'fails',
    keywords: 'fails',
    grammar_target: 'Primera Condicional',
    options_json: JSON.stringify({
      sentenceBefore: 'If a parameterized SQL query',
      sentenceAfter: ', the transaction will automatically roll back.',
      hintVerb: 'fail (presente simple)',
      chips: ['fails', 'will fail', 'failed'],
      acceptedAnswers: ['fails'],
      explanation: 'En Primera Condicional, después de "If" va Presente Simple ("fails"). Nunca pongas "will fail" dentro de la parte con "If".'
    }),
    time_limit_sec: 60
  },
  {
    category: 'fill_blank',
    domain_area: 'Git & Version Control',
    title: 'Completar: Modal Cortés en Pull Request',
    topic: 'Verbos Modales',
    cefr_level: 'B1+',
    track: 'All',
    prompt: 'Completa la sugerencia usando un verbo modal amable ("might" o "could").',
    scenario_context: 'Pidiendo renombrar una variable confusa en un Pull Request.',
    spanish_hint: 'Expresión muy común en GitHub: "You might want to..." o "You could want to...".',
    expected_pattern: 'might',
    keywords: 'might, could',
    grammar_target: 'Verbos Modales en Code Review',
    options_json: JSON.stringify({
      sentenceBefore: 'You',
      sentenceAfter: 'want to rename "data2" to "activeUsers" for better clarity.',
      hintVerb: 'modal cortés',
      chips: ['might', 'must', 'could'],
      acceptedAnswers: ['might', 'may', 'could'],
      explanation: '"You might want to..." es una de las formas más naturales y amables de sugerir mejoras en un Code Review.'
    }),
    time_limit_sec: 60
  },
  {
    category: 'fill_blank',
    domain_area: 'Web Development',
    title: 'Completar: Flujo de Autenticación Express',
    topic: 'Vocabulario de Arquitectura Web',
    cefr_level: 'B1+',
    track: 'Full-Stack',
    prompt: 'Escribe el término técnico para la capa de Express que valida el JWT.',
    scenario_context: 'Explicando la seguridad del backend Node.js.',
    spanish_hint: 'Palabra técnica en inglés para la capa intermedia que intercepta peticiones.',
    expected_pattern: 'middleware',
    keywords: 'middleware',
    grammar_target: 'Léxico de Arquitectura Web',
    options_json: JSON.stringify({
      sentenceBefore: 'Every protected Express endpoint passes through an authentication',
      sentenceAfter: 'that verifies the JWT signature.',
      hintVerb: 'término técnico',
      chips: ['middleware', 'database', 'stylesheet'],
      acceptedAnswers: ['middleware'],
      explanation: 'En Express, las funciones que interceptan la petición antes del controlador se llaman "middleware".'
    }),
    time_limit_sec: 60
  },
  {
    category: 'fill_blank',
    domain_area: 'Programming',
    title: 'Completar: Segunda Condicional en Testing',
    topic: 'Segunda Condicional',
    cefr_level: 'B2',
    track: 'QA',
    prompt: 'Completa el resultado hipotético con "would + verbo".',
    scenario_context: 'Retrospectiva del sprint tras un bug que llegó a producción.',
    spanish_hint: 'Segunda condicional en el resultado: would catch.',
    expected_pattern: 'would catch',
    keywords: 'would catch',
    grammar_target: 'Segunda Condicional',
    options_json: JSON.stringify({
      sentenceBefore: 'If we mocked edge-case null inputs in Jest, the test suite',
      sentenceAfter: 'those regressions earlier.',
      hintVerb: 'would + catch',
      chips: ['would catch', 'will catch', 'caught'],
      acceptedAnswers: ['would catch'],
      explanation: 'La Segunda Condicional une Pasado Simple ("mocked") con "would + verbo base" ("would catch").'
    }),
    time_limit_sec: 60
  },

  // ========================
  // 4. LABORATORIO DE REDACCIÓN RCA / CODE REVIEW (User Story 3)
  // ========================
  {
    category: 'incident_writing',
    domain_area: 'DevOps',
    title: 'RCA #101: Reinicio tras Fuga de Memoria',
    topic: 'Voz Pasiva Técnica',
    cefr_level: 'B2',
    track: 'DevOps',
    prompt: 'Redacta en inglés (2 oraciones) que el nodo API fue reiniciado después de que una fuga de memoria fuera identificada en Redis.',
    scenario_context: 'Reporte formal de incidente. Regla: NO uses pronombres personales ("I", "we"), usa voz pasiva.',
    spanish_hint: 'En lugar de "We restarted the server", escribe: "The API node was restarted after a memory leak was identified..."',
    expected_pattern: 'The API node was restarted after a memory leak was identified in the Redis cache. Traffic was safely rerouted during recovery.',
    keywords: 'was restarted, was identified, memory leak, cache',
    grammar_target: 'Voz Pasiva Técnica',
    options_json: null,
    time_limit_sec: 120
  },
  {
    category: 'incident_writing',
    domain_area: 'Web Development',
    title: 'RCA #102: Regla de Failover (Condicional)',
    topic: 'Primera Condicional (sin "will" tras "if")',
    cefr_level: 'B1+',
    track: 'Full-Stack',
    prompt: 'Escribe en inglés la regla: si la pasarela de pagos excede el tiempo límite, el sistema devolverá una respuesta fallback.',
    scenario_context: 'Documentación de resiliencia. Regla: no pongas "will" dentro de la cláusula con "if".',
    spanish_hint: 'Ejemplo guía: "If the payment gateway times out, the circuit breaker will return a fallback response."',
    expected_pattern: 'If the payment gateway times out, the circuit breaker will return a fallback response and log the incident.',
    keywords: 'if, times out, will, fallback',
    grammar_target: 'Primera Condicional',
    options_json: null,
    time_limit_sec: 120
  },
  {
    category: 'incident_writing',
    domain_area: 'Git & Version Control',
    title: 'PR Review #204: Sugerencia Cortés de Variables de Entorno',
    topic: 'Verbos Modales en Code Reviews',
    cefr_level: 'B2',
    track: 'All',
    prompt: 'Escribe un comentario respetuoso en un Pull Request sugiriendo mover las credenciales SQL a variables de entorno (.env).',
    scenario_context: 'Un compañero subió contraseñas en código plano. Usa modales corteses ("Could we...", "You might...").',
    spanish_hint: 'Ejemplo guía: "Could we move the SQL credentials into environment variables so secrets are not committed to Git?"',
    expected_pattern: 'Could we move the SQL credentials into environment variables so secrets are not committed to Git?',
    keywords: 'could, might, should, environment, variables',
    grammar_target: 'Verbos Modales en Code Review',
    options_json: null,
    time_limit_sec: 120
  },

  // ========================
  // 5. REUNIONES SCRUM Y PRÁCTICA ORAL (User Story 2 + Audio Logs)
  // ========================
  {
    category: 'standup',
    domain_area: 'Agile & Scrum',
    title: 'Daily Standup: Fuga de Memoria Resuelta',
    topic: 'Yesterday / Today / Blockers',
    cefr_level: 'B1+',
    track: 'Full-Stack',
    prompt: 'Di en voz alta en inglés que ayer el servidor fue reiniciado tras identificar un memory leak, hoy estás desplegando pruebas unitarias y no tienes bloqueos.',
    scenario_context: 'Simulación de Daily Standup a las 9:00 AM con equipo internacional.',
    spanish_hint: 'Puedes leer o adaptar esta guía: "Yesterday, the server was restarted after a memory leak was identified in the auth cache. Today, I am deploying unit tests, and I have no blockers."',
    expected_pattern: 'Yesterday the server was restarted after a memory leak was identified in the auth cache. Today I am deploying unit tests and I have no blockers.',
    keywords: 'yesterday, server, restarted, memory leak, identified, today, unit tests, blockers',
    grammar_target: 'Voz Pasiva Técnica',
    options_json: JSON.stringify({
      yesterdayCue: 'Ayer: Server restarted after memory leak was identified',
      todayCue: 'Hoy: Deploying unit tests for token cache',
      blockerCue: 'Bloqueos: No blockers'
    }),
    time_limit_sec: 90
  },
  {
    category: 'standup',
    domain_area: 'Databases',
    title: 'Daily Standup: Deadlock en SQL Server',
    topic: 'Reporte de Base de Datos',
    cefr_level: 'B2',
    track: 'Full-Stack',
    prompt: 'Reporta en inglés que ayer se resolvió un deadlock en SQL Server agregando un índice, y hoy estás verificando el throughput en staging.',
    scenario_context: 'Daily Standup posterior a una alerta de lentitud en checkout.',
    spanish_hint: 'Guía en inglés: "Yesterday a database deadlock in SQL Server was resolved by adding a composite index. Today I am verifying API throughput in staging."',
    expected_pattern: 'Yesterday a database deadlock in SQL Server was resolved by adding a composite index. Today I am verifying API throughput in staging.',
    keywords: 'deadlock, sql server, resolved, index, today, throughput, staging',
    grammar_target: 'Voz Pasiva + Presente Continuo',
    options_json: JSON.stringify({
      yesterdayCue: 'Ayer: SQL Server deadlock was resolved by adding an index',
      todayCue: 'Hoy: Verifying API throughput in staging',
      blockerCue: 'Bloqueos: Waiting on QA sign-off'
    }),
    time_limit_sec: 90
  },
  {
    category: 'standup',
    domain_area: 'Git & Version Control',
    title: 'Daily Standup: Conflicto de Git y Bloqueo QA',
    topic: 'Comunicar Bloqueos con Claridad',
    cefr_level: 'B1',
    track: 'QA',
    prompt: 'Explica en voz alta que ayer resolviste un merge conflict en la rama login, hoy ejecutas pruebas de regresión y tu bloqueo son credenciales faltantes.',
    scenario_context: 'Sincronización diaria entre QA y Frontend.',
    spanish_hint: 'Guía en inglés: "Yesterday I resolved a merge conflict on the login branch. Today I am running regression tests, and my blocker is missing staging credentials."',
    expected_pattern: 'Yesterday I resolved a merge conflict on the login branch. Today I am running regression tests, and my blocker is missing staging credentials.',
    keywords: 'yesterday, merge conflict, login, today, regression, blocker, credentials',
    grammar_target: 'Reporte de Bloqueos',
    options_json: JSON.stringify({
      yesterdayCue: 'Ayer: Resolved merge conflict on login branch',
      todayCue: 'Hoy: Running automated regression tests',
      blockerCue: 'Bloqueos: Missing staging environment credentials'
    }),
    time_limit_sec: 90
  },
  {
    category: 'sprint_audio',
    domain_area: 'Agile & Scrum',
    title: 'Audio Log #1: Alerta de Pipeline DevOps',
    topic: 'Comprensión Auditiva',
    cefr_level: 'B1+',
    track: 'DevOps',
    prompt: 'Escucha el audio de tu compañera Sarah y responde por qué se revirtió el despliegue.',
    scenario_context: 'Nota de voz simulada en Slack antes de iniciar tu turno.',
    spanish_hint: 'Pon atención a las palabras: "rolled back", "smoke tests", "502 error", "middleware".',
    expected_pattern: 'The deployment was rolled back because smoke tests detected a 502 error from the auth middleware.',
    keywords: 'rolled back, smoke tests, 502, middleware',
    grammar_target: 'Comprensión de Causa y Efecto',
    options_json: JSON.stringify({
      audioScript: 'Hey team, quick update before standup. Yesterday evening, the staging deployment was rolled back automatically because our smoke tests detected a 502 gateway error coming from the authentication middleware. If the database connection pool fills up again today, the health check will alert Slack immediately. Could someone from backend review my pull request for the pool timeout fix?',
      question: 'Según el audio, ¿por qué se revirtió automáticamente el despliegue en staging?',
      choices: [
        'Because the frontend Tailwind bundle failed to compile.',
        'Because smoke tests detected a 502 error from the authentication middleware.',
        'Because a developer deleted the SQL Server database.',
        'Because Sarah forgot to merge the pull request.'
      ],
      correctIndex: 1,
      explanation: 'Sarah menciona exactamente: "the staging deployment was rolled back automatically because our smoke tests detected a 502 gateway error coming from the authentication middleware."'
    }),
    time_limit_sec: 90
  },
  {
    category: 'sprint_audio',
    domain_area: 'Databases',
    title: 'Audio Log #2: Optimización de Índices SQL',
    topic: 'Comprensión Auditiva',
    cefr_level: 'B2',
    track: 'Full-Stack',
    prompt: 'Escucha el reporte de Carlos e identifica qué lo tiene bloqueado actualmente.',
    scenario_context: 'Actualización de audio del Sprint Review.',
    spanish_hint: 'Escucha qué acceso dice que todavía necesita ("still need...").',
    expected_pattern: 'He is blocked waiting for read-only production metrics from the monitoring dashboard.',
    keywords: 'blocked, metrics, monitoring',
    grammar_target: 'Identificación de Bloqueos',
    options_json: JSON.stringify({
      audioScript: 'Good morning everyone. Earlier this week, three missing foreign key indexes were added to the ExerciseScores table, which cut query latency by forty percent. Today I plan to tune the spaced repetition stored query, however I am currently blocked because I still need read-only access to the production telemetry dashboard.',
      question: '¿Qué está bloqueando a Carlos en este momento?',
      choices: [
        'He needs to learn how SQL indexes work.',
        'The ExerciseScores table was accidentally dropped.',
        'He is waiting for read-only access to the production telemetry dashboard.',
        'Latency increased by forty percent after adding indexes.'
      ],
      correctIndex: 2,
      explanation: 'Carlos indica: "I am currently blocked because I still need read-only access to the production telemetry dashboard."'
    }),
    time_limit_sec: 90
  },

  // ========================
  // 6. SIMULADOR DE ENTREVISTAS TÉCNICAS (Tech Screen)
  // ========================
  {
    category: 'interview',
    domain_area: 'Web Development',
    title: 'Entrevista #1: Autenticación JWT y Seguridad',
    topic: 'Seguridad Backend',
    cefr_level: 'B2',
    track: 'Full-Stack',
    prompt: 'In under 90 seconds, explain how JWT authentication works in an Express API and why passwords must be hashed with bcrypt instead of stored in plain text.',
    scenario_context: 'Entrevista técnica en inglés con una Engineering Manager de EE. UU.',
    spanish_hint: 'Explica en 3 pasos: 1) Login verifica contraseña con bcrypt, 2) El servidor firma un JWT stateless, 3) Un middleware valida el token en cada ruta.',
    expected_pattern: 'When a user logs in, credentials are verified against a bcrypt hash and the server issues a signed JWT. Protected Express routes use middleware to verify the token signature on each request.',
    keywords: 'jwt, token, bcrypt, hash, middleware, verify, signature, stateless',
    grammar_target: 'Explicaciones Técnicas y Voz Pasiva',
    options_json: JSON.stringify({
      promptEs: 'Explica en inglés cómo funciona la autenticación con JWT en Express y por qué las contraseñas se cifran con bcrypt.',
      interviewerPersona: 'Elena Vance — Staff Engineer (San Francisco)',
      followUpTip: 'Estructura tu respuesta en 3 partes: Verificación bcrypt → Emisión de JWT → Validación en middleware.'
    }),
    time_limit_sec: 90
  },
  {
    category: 'interview',
    domain_area: 'Databases',
    title: 'Entrevista #2: Diagnosticar Consulta SQL Lenta',
    topic: 'Rendimiento de Base de Datos',
    cefr_level: 'B2',
    track: 'Full-Stack',
    prompt: 'A SQL Server query taking 4 seconds is slowing down the user dashboard. Explain step by step how you would diagnose and optimize it.',
    scenario_context: 'Ronda técnica de backend con enfoque en SQL Server.',
    spanish_hint: 'Menciona: revisar execution plan, detectar table scan, agregar índices en llaves foráneas, evitar consultas N+1.',
    expected_pattern: 'First, I would inspect the execution plan to check for full table scans. Then, appropriate indexes would be added on foreign keys and filter columns, and unnecessary joins or N+1 queries would be eliminated.',
    keywords: 'execution plan, index, scan, foreign key, latency, optimize, query',
    grammar_target: 'Segunda Condicional y Secuencia',
    options_json: JSON.stringify({
      promptEs: 'Una consulta en SQL Server tarda 4 segundos. Explica paso a paso en inglés cómo la diagnosticarías y optimizarías.',
      interviewerPersona: 'Marcus Chen — Principal Data Engineer',
      followUpTip: 'Usa conectores de orden ("First", "Next", "Finally") y condicionales ("I would inspect...").'
    }),
    time_limit_sec: 90
  },
  {
    category: 'interview',
    domain_area: 'Programming',
    title: 'Entrevista #3: REST API vs GraphQL',
    topic: 'Diseño de APIs',
    cefr_level: 'B1+',
    track: 'Full-Stack',
    prompt: 'When would you choose a REST API over GraphQL for a web application, and what are the trade-offs?',
    scenario_context: 'Pregunta clásica de arquitectura para puesto Full-Stack.',
    spanish_hint: 'Compara: REST es más simple y cacheable por HTTP; GraphQL evita over-fetching cuando hay datos anidados.',
    expected_pattern: 'REST is simpler to cache at the HTTP layer and ideal for standard CRUD resources, whereas GraphQL prevents over-fetching when clients need deeply nested data from multiple entities.',
    keywords: 'rest, graphql, cache, over-fetching, endpoints, schema',
    grammar_target: 'Contraste (whereas)',
    options_json: JSON.stringify({
      promptEs: '¿Cuándo elegirías una API REST sobre GraphQL y cuáles son las ventajas/desventajas de cada una?',
      interviewerPersona: 'Priya Nair — Engineering Lead',
      followUpTip: 'Contrasta ambas opciones usando "whereas" o "on the other hand".'
    }),
    time_limit_sec: 90
  },
  {
    category: 'interview',
    domain_area: 'DevOps',
    title: 'Entrevista #4: Despliegues Seguros y Rollbacks',
    topic: 'DevOps y CI/CD',
    cefr_level: 'B2',
    track: 'DevOps',
    prompt: 'How would you ensure a safe deployment and quick rollback if a newly released Express API begins throwing 500 errors?',
    scenario_context: 'Entrevista de Cloud / SRE.',
    spanish_hint: 'Habla de: pruebas automatizadas en CI, health checks y rollback automático a la versión estable.',
    expected_pattern: 'Before deployment, automated tests are run in CI. If health checks fail after release, traffic is routed back to the previous stable build via an automated rollback.',
    keywords: 'automated, tests, health check, rollback, stable, pipeline',
    grammar_target: 'Primera Condicional y Voz Pasiva',
    options_json: JSON.stringify({
      promptEs: '¿Cómo garantizarías un despliegue seguro y un rollback rápido si la nueva versión empieza a dar errores 500?',
      interviewerPersona: 'David Miller — SRE Manager',
      followUpTip: 'Combina Primera Condicional ("If health checks fail...") con voz pasiva.'
    }),
    time_limit_sec: 90
  },
  {
    category: 'interview',
    domain_area: 'Git & Version Control',
    title: 'Entrevista #5: Hotfix en Producción con Git',
    topic: 'Flujo Git y QA',
    cefr_level: 'B1+',
    track: 'QA',
    prompt: 'A critical bug is discovered in production while features are being developed on other branches. Explain your Git branching and testing workflow to ship a hotfix.',
    scenario_context: 'Entrevista de QA Automation y Release Engineering.',
    spanish_hint: 'Pasos: crear rama hotfix desde main, aplicar fix mínimo, correr pruebas de regresión, Code Review y merge.',
    expected_pattern: 'A hotfix branch is created from main, the minimal bug fix is implemented and verified with regression tests, and after code review the pull request is merged back into main and development branches.',
    keywords: 'hotfix, main, branch, regression, pull request, review, merge',
    grammar_target: 'Secuencia en Voz Pasiva',
    options_json: JSON.stringify({
      promptEs: 'Aparece un bug crítico en producción mientras hay ramas en desarrollo. Explica en inglés tu flujo con Git y pruebas para sacar un hotfix.',
      interviewerPersona: 'Laura Gómez — QA Architect',
      followUpTip: 'Describe los pasos en orden cronológico claro.'
    }),
    time_limit_sec: 90
  },

  // ========================
  // 7. EJERCICIOS ESPECIALIZADOS POR CARRERA (FULL-STACK, QA, DEVOPS)
  // ========================
  // --- FULL-STACK ---
  {
    category: 'vocabulary',
    domain_area: 'Web Development',
    title: 'CORS Preflight Request',
    topic: 'Seguridad Browser & API',
    cefr_level: 'B1+',
    track: 'Full-Stack',
    prompt: 'Explica en inglés qué es un "CORS preflight request" y cuándo lo envía el navegador.',
    scenario_context: 'Tu frontend en Vite (puerto 5173) llama a Express (puerto 4000) con un header Authorization.',
    spanish_hint: 'Preflight = petición OPTIONS previa que pregunta al servidor si acepta el origen y los headers.',
    expected_pattern: 'A CORS preflight request is an HTTP OPTIONS check sent by the browser to verify that the backend allows cross-origin requests and custom headers.',
    keywords: 'cors, preflight, options, browser, cross-origin, headers',
    grammar_target: 'Voz Pasiva en Navegadores',
    options_json: JSON.stringify({
      term: 'CORS Preflight',
      spanishTranslation: 'Verificación previa de origen cruzado (CORS)',
      phonetic: '/ˈpriː.flaɪt/',
      partOfSpeech: 'frase nominal',
      shortDefinition: 'An automatic HTTP OPTIONS request sent by browsers before non-simple cross-origin API calls.',
      spanishDefinition: 'Petición OPTIONS automática que envía el navegador antes de un POST/PUT/DELETE con JWT hacia otro puerto o dominio.',
      example: 'The Authorization header triggered a CORS preflight check before the POST request was allowed.',
      exampleEs: 'El encabezado Authorization disparó una verificación preflight de CORS antes de permitir el POST.'
    }),
    time_limit_sec: 90
  },
  {
    category: 'vocabulary',
    domain_area: 'Databases',
    title: 'N+1 Query Problem',
    topic: 'Optimización ORM y SQL',
    cefr_level: 'B2',
    track: 'Full-Stack',
    prompt: 'Explica en inglés el problema de rendimiento "N+1 queries" y cómo se soluciona en SQL.',
    scenario_context: 'Un endpoint tarda 3 segundos porque consulta usuarios y luego hace 1 consulta por cada usuario.',
    spanish_hint: 'Solución: usar JOIN o una sola consulta batch (IN) en lugar de consultas dentro de un bucle.',
    expected_pattern: 'The N+1 query problem happens when an application runs one query for parent records and N extra queries inside a loop; it is solved using SQL JOINs or eager loading.',
    keywords: 'n+1, query, loop, join, eager loading, records',
    grammar_target: 'Cláusulas Causales y Pasiva',
    options_json: JSON.stringify({
      term: 'N+1 Query Problem',
      spanishTranslation: 'Problema de consultas N+1 en bucles',
      phonetic: '/ɛn plʌs wʌn ˈkwɪə.ri/',
      partOfSpeech: 'frase nominal',
      shortDefinition: 'Performance anti-pattern where fetching N child items triggers N separate database round-trips.',
      spanishDefinition: 'Antipatrón donde traer N registros padre dispara N consultas extra a SQL Server dentro de un ciclo.',
      example: 'By replacing the loop with a single SQL JOIN, the N+1 bottleneck was eliminated.',
      exampleEs: 'Al reemplazar el ciclo por un único JOIN en SQL, el cuello de botella N+1 fue eliminado.'
    }),
    time_limit_sec: 90
  },
  {
    category: 'grammar_quiz',
    domain_area: 'Web Development',
    title: 'Full-Stack: React State & Side Effects',
    topic: 'Vocabulario Técnico de Frontend',
    cefr_level: 'B1+',
    track: 'Full-Stack',
    prompt: 'Elige la explicación técnica más precisa sobre el ciclo de actualización en React.',
    scenario_context: 'Code review de un componente React 18 que hacía llamadas infinitas al backend.',
    spanish_hint: 'Busca la opción que mencione array de dependencias en useEffect sin errores de tiempo verbal.',
    expected_pattern: 'If the dependency array is omitted, useEffect will run after every render.',
    keywords: 'dependency array, omitted, useEffect',
    grammar_target: 'Primera Condicional (Frontend)',
    options_json: JSON.stringify({
      question: 'Which technical explanation accurately warns about a missing useEffect dependency array?',
      choices: [
        'If the dependency array will be omitted, useEffect runs forever.',
        'If the dependency array is omitted, useEffect will run after every render.',
        'If the dependency array omitting, React crash the component.',
        'When dependency array omitted, useEffect was run.'
      ],
      correctIndex: 1,
      explanation: 'Primera Condicional correcta: "If the dependency array is omitted" (Presente Simple en pasiva) + "will run after every render".'
    }),
    time_limit_sec: 60
  },
  {
    category: 'fill_blank',
    domain_area: 'Databases',
    title: 'Full-Stack: Consultas Parametrizadas',
    topic: 'Seguridad contra SQL Injection',
    cefr_level: 'B1+',
    track: 'Full-Stack',
    prompt: 'Completa la oración con el verbo en voz pasiva correcto para explicar cómo prevenimos SQL Injection.',
    scenario_context: 'Auditoría de seguridad en endpoints de Node.js + SQL Server.',
    spanish_hint: 'Sujeto plural ("user inputs") + are + participio pasado (sanitized / bound / parameterized).',
    expected_pattern: 'are sanitized',
    keywords: 'are sanitized, are parameterized',
    grammar_target: 'Voz Pasiva en Presente',
    options_json: JSON.stringify({
      sentenceBefore: 'In our Express API, all user inputs',
      sentenceAfter: 'through parameterized SQL queries before execution.',
      hintVerb: 'are + participio (sanitize / bind)',
      chips: ['are sanitized', 'is sanitized', 'sanitized'],
      acceptedAnswers: ['are sanitized', 'are bound', 'are validated', 'are parameterized'],
      explanation: 'Con el sujeto plural "all user inputs" en presente habitual, la voz pasiva correcta es "are sanitized" (o "are bound" / "are validated").'
    }),
    time_limit_sec: 60
  },

  // --- QA AUTOMATION ---
  {
    category: 'vocabulary',
    domain_area: 'Agile & Scrum',
    title: 'Flaky Test & Race Condition',
    topic: 'Estabilidad de Pruebas E2E',
    cefr_level: 'B2',
    track: 'QA',
    prompt: 'Explica en inglés qué es un "flaky test" en Cypress o Playwright y cómo se estabiliza.',
    scenario_context: 'El pipeline de CI falla aleatoriamente en pruebas end-to-end aunque el código no cambió.',
    spanish_hint: 'Flaky test = prueba inestable que a veces pasa y a veces falla por esperas fijas o asincronía.',
    expected_pattern: 'A flaky test passes and fails inconsistently without code changes, usually caused by timing race conditions or hardcoded sleeps instead of explicit waits.',
    keywords: 'flaky test, inconsistently, race conditions, explicit waits, timing',
    grammar_target: 'Causas y Contraste',
    options_json: JSON.stringify({
      term: 'Flaky Test',
      spanishTranslation: 'Prueba inestable / intermitente',
      phonetic: '/ˈfleɪ.ki tɛst/',
      partOfSpeech: 'frase nominal',
      shortDefinition: 'An automated test that yields both passing and failing results across identical runs.',
      spanishDefinition: 'Prueba automatizada que pasa o falla de forma intermitente sin modificar el código fuente.',
      example: 'The flaky checkout test was stabilized after replacing sleep(2000) with an explicit API wait.',
      exampleEs: 'La prueba inestable de checkout se estabilizó al reemplazar sleep(2000) por una espera explícita de API.'
    }),
    time_limit_sec: 90
  },
  {
    category: 'vocabulary',
    domain_area: 'Programming',
    title: 'Mocking & Stubbing in Unit Tests',
    topic: 'Aislamiento de Dependencias',
    cefr_level: 'B1+',
    track: 'QA',
    prompt: 'Explica en inglés por qué usamos "mocking" al probar servicios que llaman a SQL Server o APIs externas.',
    scenario_context: 'Diseñando pruebas unitarias rápidas en Jest sin depender de internet o base de datos real.',
    spanish_hint: 'Mocking = simular dependencias externas para probar la lógica de negocio de forma aislada y rápida.',
    expected_pattern: 'Mocking replaces external dependencies like databases or payment APIs with simulated responses so unit tests run fast and deterministically.',
    keywords: 'mocking, replaces, external, dependencies, simulated, deterministic',
    grammar_target: 'Cláusulas de Propósito (so...)',
    options_json: JSON.stringify({
      term: 'Mocking & Stubbing',
      spanishTranslation: 'Simulación de dependencias en pruebas',
      phonetic: '/ˈmɒk.ɪŋ/',
      partOfSpeech: 'sustantivo',
      shortDefinition: 'Simulating external services or database calls during unit tests to isolate logic under test.',
      spanishDefinition: 'Reemplazar servicios externos o consultas reales con respuestas simuladas para aislar la función probada.',
      example: 'By mocking the email gateway, our unit suite executes 200 assertions in under one second.',
      exampleEs: 'Al simular la pasarela de correo, nuestra suite unitaria ejecuta 200 aserciones en menos de un segundo.'
    }),
    time_limit_sec: 90
  },
  {
    category: 'grammar_quiz',
    domain_area: 'Agile & Scrum',
    title: 'QA: Bug Severity vs Priority',
    topic: 'Triage de Defectos',
    cefr_level: 'B1+',
    track: 'QA',
    prompt: 'Elige la frase más clara para reportar un defecto crítico en un Bug Triage en inglés.',
    scenario_context: 'Reportando un fallo que impide el login en Safari antes del release.',
    spanish_hint: 'Busca uso correcto de voz pasiva y descripción clara de impacto.',
    expected_pattern: 'This blocker was reproduced on Safari 17 and prevents users from signing in.',
    keywords: 'reproduced, prevents, signing in',
    grammar_target: 'Reporte de Defectos QA',
    options_json: JSON.stringify({
      question: 'Which sentence clearly communicates a P1 bug reproduction in a QA triage meeting?',
      choices: [
        'I am seeing bug in Safari and users cannot login yesterday.',
        'This blocker was reproduced on Safari 17 and prevents users from signing in.',
        'If Safari will fail, login not working for nobody.',
        'The bug reproducing itself when clicking submit.'
      ],
      correctIndex: 1,
      explanation: '"This blocker was reproduced on Safari 17..." usa voz pasiva profesional ("was reproduced") y verbo transitivo correcto ("prevents users from signing in").'
    }),
    time_limit_sec: 60
  },
  {
    category: 'incident_writing',
    domain_area: 'Agile & Scrum',
    title: 'QA Sign-off: Reporte de Regresión y Criterio',
    topic: 'Voz Pasiva y Primera Condicional (QA)',
    cefr_level: 'B2',
    track: 'QA',
    prompt: 'Redacta en inglés un reporte breve de QA indicando que la suite de regresión fue ejecutada y si aparecen errores críticos, el lanzamiento será pospuesto.',
    scenario_context: 'Mensaje oficial de QA en el canal de #release-readiness.',
    spanish_hint: 'Guía: "The regression suite was executed on staging. If any critical defects appear, the release will be postponed."',
    expected_pattern: 'The regression suite was executed on staging with 98% coverage. If critical defects appear, the release will be postponed.',
    keywords: 'was executed, regression, if, will be postponed',
    grammar_target: 'Voz Pasiva + Primera Condicional',
    options_json: null,
    time_limit_sec: 120
  },
  {
    category: 'standup',
    domain_area: 'Agile & Scrum',
    title: 'QA Standup: Cobertura E2E y Bug P1',
    topic: 'Reporte Diario de QA',
    cefr_level: 'B1+',
    track: 'QA',
    prompt: 'Di en voz alta que ayer los tests E2E fueron ejecutados en staging, hoy estás validando un hotfix y estás bloqueado por falta de datos de prueba.',
    scenario_context: 'Daily Standup del equipo de QA Automation.',
    spanish_hint: 'Guía: "Yesterday the end to end tests were executed in staging. Today I am verifying the login hotfix, and my blocker is missing test data."',
    expected_pattern: 'Yesterday the end to end tests were executed in staging. Today I am verifying the login hotfix and my blocker is missing test data.',
    keywords: 'yesterday, tests, executed, staging, today, verifying, hotfix, blocker, test data',
    grammar_target: 'Voz Pasiva + Bloqueos QA',
    options_json: JSON.stringify({
      yesterdayCue: 'Ayer: E2E tests were executed in staging',
      todayCue: 'Hoy: Verifying the login hotfix',
      blockerCue: 'Bloqueos: Missing seeded test data'
    }),
    time_limit_sec: 90
  },

  // --- DEVOPS / SRE ---
  {
    category: 'vocabulary',
    domain_area: 'DevOps',
    title: 'Blue-Green & Canary Deployment',
    topic: 'Estrategias de Despliegue',
    cefr_level: 'B2',
    track: 'DevOps',
    prompt: 'Explica en inglés la diferencia entre despliegue "Blue-Green" y "Canary".',
    scenario_context: 'Diseñando entregas sin tiempo de inactividad (zero-downtime) en la nube.',
    spanish_hint: 'Blue-Green cambia todo el tráfico entre dos entornos idénticos; Canary envía primero 5-10% del tráfico.',
    expected_pattern: 'Blue-green deployment switches all traffic between two identical environments, whereas a canary release gradually routes a small percentage of users to the new version.',
    keywords: 'blue-green, traffic, identical, environments, canary, percentage',
    grammar_target: 'Contraste (whereas)',
    options_json: JSON.stringify({
      term: 'Canary vs Blue-Green',
      spanishTranslation: 'Despliegue gradual (Canary) vs Entornos gemelos',
      phonetic: '/kəˈnɛər.i dɪˈplɔɪ.mənt/',
      partOfSpeech: 'frase nominal',
      shortDefinition: 'Zero-downtime release strategies that limit blast radius when shipping new software versions.',
      spanishDefinition: 'Estrategias sin caídas: Blue-Green cambia entre dos servidores completos; Canary prueba con un pequeño porcentaje de usuarios primero.',
      example: 'A canary release exposed the memory leak to only 5% of traffic before automatic rollback.',
      exampleEs: 'Un despliegue canary expuso la fuga de memoria a solo el 5% del tráfico antes del rollback automático.'
    }),
    time_limit_sec: 90
  },
  {
    category: 'vocabulary',
    domain_area: 'DevOps',
    title: 'Container Orchestration & CrashLoopBackOff',
    topic: 'Docker y Kubernetes',
    cefr_level: 'B2',
    track: 'DevOps',
    prompt: 'Explica en inglés qué indica el estado "CrashLoopBackOff" en un pod de Kubernetes.',
    scenario_context: 'Un microservicio recién desplegado en Kubernetes no logra mantenerse encendido.',
    spanish_hint: 'CrashLoopBackOff = el contenedor arranca, falla repetidamente y Kubernetes espera cada vez más antes de reiniciarlo.',
    expected_pattern: 'CrashLoopBackOff indicates that a container repeatedly starts and crashes, causing Kubernetes to wait with exponential backoff between restart attempts.',
    keywords: 'container, crashes, kubernetes, restart, backoff',
    grammar_target: 'Causa y Consecuencia',
    options_json: JSON.stringify({
      term: 'CrashLoopBackOff',
      spanishTranslation: 'Bucle de reinicios fallidos en Kubernetes',
      phonetic: '/kræʃ luːp bæk ɒf/',
      partOfSpeech: 'término técnico',
      shortDefinition: 'Kubernetes pod status showing a container keeps crashing immediately after startup.',
      spanishDefinition: 'Estado de Kubernetes cuando un contenedor falla al arrancar y entra en ciclos de reinicio con espera progresiva.',
      example: 'The CrashLoopBackOff alert was triggered because an environment variable was missing.',
      exampleEs: 'La alerta CrashLoopBackOff se disparó porque faltaba una variable de entorno.'
    }),
    time_limit_sec: 90
  },
  {
    category: 'fill_blank',
    domain_area: 'DevOps',
    title: 'DevOps: Segunda Condicional en Alta Disponibilidad',
    topic: 'Segunda Condicional (SRE)',
    cefr_level: 'B2',
    track: 'DevOps',
    prompt: 'Completa la oración hipotética sobre redundancia de regiones en la nube.',
    scenario_context: 'Revisión de arquitectura de resiliencia ante caída de centro de datos.',
    spanish_hint: 'Segunda Condicional: después de "If" usa Pasado Simple ("went down").',
    expected_pattern: 'went down',
    keywords: 'went down, failed',
    grammar_target: 'Segunda Condicional',
    options_json: JSON.stringify({
      sentenceBefore: 'If the primary SQL Server region',
      sentenceAfter: ', traffic would automatically fail over to the secondary replica.',
      hintVerb: 'go down (pasado simple)',
      chips: ['went down', 'goes down', 'would go down'],
      acceptedAnswers: ['went down', 'failed', 'crashed'],
      explanation: 'Como la segunda parte tiene "would automatically fail over", la cláusula "If" necesita Pasado Simple ("went down").'
    }),
    time_limit_sec: 60
  },
  {
    category: 'standup',
    domain_area: 'DevOps',
    title: 'DevOps Standup: Migración Docker y Alerta CPU',
    topic: 'Reporte Diario SRE / DevOps',
    cefr_level: 'B2',
    track: 'DevOps',
    prompt: 'Reporta en inglés que ayer el contenedor Docker fue optimizado para reducir su tamaño, hoy estás configurando alertas en Prometheus y no tienes bloqueos.',
    scenario_context: 'Daily Standup de Infraestructura y Plataforma.',
    spanish_hint: 'Guía: "Yesterday the Docker container was optimized to reduce image size. Today I am configuring Prometheus alerts, and I have no blockers."',
    expected_pattern: 'Yesterday the Docker container was optimized to reduce image size. Today I am configuring Prometheus alerts and I have no blockers.',
    keywords: 'yesterday, docker, container, optimized, today, alerts, blockers',
    grammar_target: 'Voz Pasiva + Presente Continuo',
    options_json: JSON.stringify({
      yesterdayCue: 'Ayer: Docker container was optimized via multi-stage build',
      todayCue: 'Hoy: Configuring Prometheus CPU alerts',
      blockerCue: 'Bloqueos: No blockers'
    }),
    time_limit_sec: 90
  },
  {
    category: 'interview',
    domain_area: 'Agile & Scrum',
    title: 'Entrevista QA #6: Estrategia de Pruebas en CI/CD',
    topic: 'Pirámide de Pruebas (QA)',
    cefr_level: 'B2',
    track: 'QA',
    prompt: 'Explain the Testing Pyramid (unit, integration, and end-to-end tests) and how you balance speed versus confidence in a CI pipeline.',
    scenario_context: 'Entrevista técnica para QA Automation Engineer.',
    spanish_hint: 'Menciona: muchas unit tests rápidas en la base, integration tests para API/SQL, pocas E2E críticas en la cima.',
    expected_pattern: 'A healthy testing pyramid relies on many fast unit tests at the base, integration tests to verify Express and SQL Server interactions, and a focused set of critical end-to-end tests at the top.',
    keywords: 'unit tests, integration, end-to-end, fast, pipeline, confidence',
    grammar_target: 'Estructuración Técnica',
    options_json: JSON.stringify({
      promptEs: 'Explica la Pirámide de Pruebas (unitarias, integración y E2E) y cómo equilibrar velocidad y confianza en CI.',
      interviewerPersona: 'Carlos Méndez — QA Director',
      followUpTip: 'Ordena de abajo hacia arriba: Base (Unit) -> Middle (Integration) -> Top (E2E).'
    }),
    time_limit_sec: 90
  },
  {
    category: 'interview',
    domain_area: 'DevOps',
    title: 'Entrevista DevOps #7: Infrastructure as Code (IaC)',
    topic: 'Terraform y Automatización',
    cefr_level: 'B2',
    track: 'DevOps',
    prompt: 'Why is Infrastructure as Code (like Terraform) preferred over configuring cloud servers manually through a web console?',
    scenario_context: 'Entrevista técnica para DevOps / Cloud Engineer.',
    spanish_hint: 'Menciona: versionado en Git, reproducibilidad, sin errores humanos, code review de infraestructura, rollback.',
    expected_pattern: 'Infrastructure as Code ensures reproducible environments because server configurations are versioned in Git, peer-reviewed in pull requests, and deployed consistently without manual drift.',
    keywords: 'reproducible, git, versioned, pull requests, manual, drift, consistent',
    grammar_target: 'Causal & Passive Voice',
    options_json: JSON.stringify({
      promptEs: '¿Por qué se prefiere Infrastructure as Code (como Terraform) frente a configurar servidores manualmente en la consola web?',
      interviewerPersona: 'Hannah Brooks — Cloud Platform Architect',
      followUpTip: 'Destaca reproducibilidad, control de versiones en Git y prevención de errores manuales.'
    }),
    time_limit_sec: 90
  }
];

export const SEED_ACHIEVEMENTS = [
  {
    code: 'FIRST_PR',
    title: 'Primer PR Fusionado',
    description: 'Completa tu primer ejercicio de LexiCode con al menos 70% de precisión.',
    icon_name: 'GitPullRequest',
    xp_reward: 50
  },
  {
    code: 'STANDUP_PRO',
    title: 'Listo para Daily Standup',
    description: 'Aprueba una simulación oral de Daily Standup con >= 80% de precisión.',
    icon_name: 'Mic',
    xp_reward: 100
  },
  {
    code: 'CLEAN_RCA',
    title: 'Autor de RCA Limpio',
    description: 'Redacta un reporte de incidente en voz pasiva técnica sin errores gramaticales.',
    icon_name: 'ShieldCheck',
    xp_reward: 100
  },
  {
    code: 'SRS_STREAK_5',
    title: 'Velocidad SRS (5 Tarjetas)',
    description: 'Domina 5 tarjetas de vocabulario técnico en tu cola de repetición espaciada.',
    icon_name: 'Layers',
    xp_reward: 120
  },
  {
    code: 'TECH_SCREEN',
    title: 'Superviviente de Tech Screen',
    description: 'Completa exitosamente una entrevista técnica cronometrada en el simulador.',
    icon_name: 'Terminal',
    xp_reward: 150
  },
  {
    code: 'PROD_DEPLOY',
    title: 'Despliegue a Producción',
    description: 'Consigue 5 Pull Requests aprobados para desbloquear tu primer despliegue.',
    icon_name: 'Rocket',
    xp_reward: 250
  }
];
