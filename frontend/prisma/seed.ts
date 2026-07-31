import { PrismaClient } from '../src/generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const connectionString = process.env.DATABASE_URL as string;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ─── Content model ───────────────────────────────────────────────────────────
// The seed is data-driven: content lives in plain objects below and a single
// loop writes it. Reviewing 45 questions as data is far easier than as 45 nested
// Prisma calls, and adding a lesson means adding an object, not more code.

interface QuizSeed {
    question: string;
    question_es: string;
    options: string[];
    options_es: string[];
    correctAnswer: string;
    correctAnswer_es: string;
}

interface LessonSeed {
    lessonTitle: string;
    lessonTitle_es: string;
    lessonContent: string;
    lessonContent_es: string;
    currencyReward: number;
    tip: { tipContent: string; tipContent_es: string };
    example: { scenario: string; scenario_es: string; analogy: string; analogy_es: string };
    quizzes: QuizSeed[];
}

interface CourseSeed {
    courseTitle: string;
    courseTitle_es: string;
    courseDescription: string;
    courseDescription_es: string;
    estimatedTime: number;
    difficultyLevel: string;
    difficultyLevel_es: string;
    lessons: LessonSeed[];
}

const courses: CourseSeed[] = [
    // ── Course 1: Saving Fundamentals ────────────────────────────────────────
    {
        courseTitle: 'Saving Fundamentals',
        courseTitle_es: 'Fundamentos del Ahorro',
        courseDescription: 'Build the habits that turn a paycheck into lasting security.',
        courseDescription_es: 'Desarrolla los hábitos que convierten un sueldo en seguridad duradera.',
        estimatedTime: 30,
        difficultyLevel: 'Beginner',
        difficultyLevel_es: 'Principiante',
        lessons: [
            {
                lessonTitle: 'Why Save Money?',
                lessonTitle_es: '¿Por qué ahorrar dinero?',
                lessonContent:
                    'Saving is money you set aside instead of spending. It gives you a cushion for surprises, freedom to make choices, and a starting point for investing later.',
                lessonContent_es:
                    'Ahorrar es dinero que apartas en lugar de gastarlo. Te da un colchón para imprevistos, libertad para tomar decisiones y un punto de partida para invertir más adelante.',
                currencyReward: 500,
                tip: {
                    tipContent: 'Pay yourself first: move money to savings the day you get paid, before you spend.',
                    tipContent_es: 'Págate a ti primero: mueve dinero al ahorro el día que cobras, antes de gastar.',
                },
                example: {
                    scenario: 'Saving $100 every month leaves you with $1,200 after one year — before any interest.',
                    scenario_es: 'Ahorrar $100 cada mes te deja $1,200 después de un año — antes de intereses.',
                    analogy: 'Saving is like storing water before the dry season: you build it up while you can.',
                    analogy_es: 'Ahorrar es como guardar agua antes de la temporada seca: la acumulas mientras puedes.',
                },
                quizzes: [
                    {
                        question: 'What is the main purpose of saving money?',
                        question_es: '¿Cuál es el propósito principal de ahorrar dinero?',
                        options: ['To be ready for emergencies', 'To impress your friends', 'To pay more in taxes', 'To spend it faster'],
                        options_es: ['Estar listo para emergencias', 'Impresionar a tus amigos', 'Pagar más impuestos', 'Gastarlo más rápido'],
                        correctAnswer: 'To be ready for emergencies',
                        correctAnswer_es: 'Estar listo para emergencias',
                    },
                    {
                        question: '"Pay yourself first" means you should:',
                        question_es: '"Págate a ti primero" significa que debes:',
                        options: ['Save before you spend', 'Spend before you save', 'Only save what is left over', 'Never save at all'],
                        options_es: ['Ahorrar antes de gastar', 'Gastar antes de ahorrar', 'Ahorrar solo lo que sobra', 'Nunca ahorrar'],
                        correctAnswer: 'Save before you spend',
                        correctAnswer_es: 'Ahorrar antes de gastar',
                    },
                    {
                        question: 'Which of these is a good reason to keep savings?',
                        question_es: '¿Cuál de estas es una buena razón para tener ahorros?',
                        options: ['A car repair you did not expect', 'A guaranteed lottery win', 'To avoid ever investing', 'Because banks require it'],
                        options_es: ['Una reparación de carro inesperada', 'Ganar la lotería garantizada', 'Para nunca invertir', 'Porque el banco lo exige'],
                        correctAnswer: 'A car repair you did not expect',
                        correctAnswer_es: 'Una reparación de carro inesperada',
                    },
                    {
                        question: 'If you save $100 a month, how much do you have after one year (no interest)?',
                        question_es: 'Si ahorras $100 al mes, ¿cuánto tienes después de un año (sin intereses)?',
                        options: ['$1,200', '$100', '$600', '$12,000'],
                        options_es: ['$1,200', '$100', '$600', '$12,000'],
                        correctAnswer: '$1,200',
                        correctAnswer_es: '$1,200',
                    },
                    {
                        question: 'Saving mainly gives you:',
                        question_es: 'Ahorrar principalmente te da:',
                        options: ['More choices and less stress', 'A higher credit card limit', 'Free stocks', 'A guaranteed job'],
                        options_es: ['Más opciones y menos estrés', 'Un límite de tarjeta más alto', 'Acciones gratis', 'Un empleo garantizado'],
                        correctAnswer: 'More choices and less stress',
                        correctAnswer_es: 'Más opciones y menos estrés',
                    },
                ],
            },
            {
                lessonTitle: 'Building an Emergency Fund',
                lessonTitle_es: 'Creando un Fondo de Emergencia',
                lessonContent:
                    'An emergency fund is cash reserved only for real emergencies — job loss, medical bills, urgent repairs. A common target is three to six months of expenses.',
                lessonContent_es:
                    'Un fondo de emergencia es dinero reservado solo para emergencias reales — pérdida de empleo, gastos médicos, reparaciones urgentes. Una meta común es de tres a seis meses de gastos.',
                currencyReward: 500,
                tip: {
                    tipContent: 'Keep your emergency fund in a separate account so you are not tempted to spend it.',
                    tipContent_es: 'Guarda tu fondo de emergencia en una cuenta separada para no tener la tentación de gastarlo.',
                },
                example: {
                    scenario: 'If you spend $2,000 a month, a three-month emergency fund is $6,000.',
                    scenario_es: 'Si gastas $2,000 al mes, un fondo de emergencia de tres meses es $6,000.',
                    analogy: 'An emergency fund is the spare tire of your finances — boring until the day you need it.',
                    analogy_es: 'Un fondo de emergencia es la llanta de repuesto de tus finanzas — aburrida hasta el día que la necesitas.',
                },
                quizzes: [
                    {
                        question: 'An emergency fund is meant for:',
                        question_es: 'Un fondo de emergencia es para:',
                        options: ['Unexpected, urgent costs', 'A vacation you planned', 'Buying stocks on a dip', 'Everyday groceries'],
                        options_es: ['Gastos urgentes inesperados', 'Unas vacaciones planeadas', 'Comprar acciones en una caída', 'La despensa diaria'],
                        correctAnswer: 'Unexpected, urgent costs',
                        correctAnswer_es: 'Gastos urgentes inesperados',
                    },
                    {
                        question: 'A common target for an emergency fund is:',
                        question_es: 'Una meta común para un fondo de emergencia es:',
                        options: ['3 to 6 months of expenses', '10 years of income', 'Exactly $50', 'One week of pay'],
                        options_es: ['3 a 6 meses de gastos', '10 años de ingresos', 'Exactamente $50', 'Una semana de sueldo'],
                        correctAnswer: '3 to 6 months of expenses',
                        correctAnswer_es: '3 a 6 meses de gastos',
                    },
                    {
                        question: 'If you spend $2,000 a month, a three-month fund is:',
                        question_es: 'Si gastas $2,000 al mes, un fondo de tres meses es:',
                        options: ['$6,000', '$2,000', '$600', '$20,000'],
                        options_es: ['$6,000', '$2,000', '$600', '$20,000'],
                        correctAnswer: '$6,000',
                        correctAnswer_es: '$6,000',
                    },
                    {
                        question: 'Why keep an emergency fund in a separate account?',
                        question_es: '¿Por qué guardar el fondo de emergencia en una cuenta separada?',
                        options: ['So it is harder to spend by accident', 'Because it earns no interest anywhere else', 'To hide it from taxes', 'Banks require two accounts'],
                        options_es: ['Para que sea más difícil gastarlo sin querer', 'Porque no gana intereses en otro lugar', 'Para ocultarlo de los impuestos', 'El banco exige dos cuentas'],
                        correctAnswer: 'So it is harder to spend by accident',
                        correctAnswer_es: 'Para que sea más difícil gastarlo sin querer',
                    },
                    {
                        question: 'Which situation is a true emergency?',
                        question_es: '¿Cuál situación es una verdadera emergencia?',
                        options: ['Losing your job suddenly', 'A shoe sale', 'A concert ticket', 'A new phone release'],
                        options_es: ['Perder tu empleo de repente', 'Una oferta de zapatos', 'Un boleto de concierto', 'El lanzamiento de un teléfono nuevo'],
                        correctAnswer: 'Losing your job suddenly',
                        correctAnswer_es: 'Perder tu empleo de repente',
                    },
                ],
            },
            {
                lessonTitle: 'Budgeting with 50/30/20',
                lessonTitle_es: 'Presupuesto con 50/30/20',
                lessonContent:
                    'The 50/30/20 rule splits your after-tax income: 50% to needs, 30% to wants, and 20% to savings and debt payoff. It is a simple starting framework, not a strict law.',
                lessonContent_es:
                    'La regla 50/30/20 divide tu ingreso después de impuestos: 50% a necesidades, 30% a deseos y 20% a ahorro y pago de deudas. Es un marco inicial simple, no una ley estricta.',
                currencyReward: 600,
                tip: {
                    tipContent: 'Track spending for one month first — you cannot budget numbers you have never measured.',
                    tipContent_es: 'Registra tus gastos por un mes primero — no puedes presupuestar números que nunca has medido.',
                },
                example: {
                    scenario: 'On $3,000 a month, 50/30/20 is $1,500 needs, $900 wants, $600 savings.',
                    scenario_es: 'Con $3,000 al mes, 50/30/20 es $1,500 necesidades, $900 deseos, $600 ahorro.',
                    analogy: 'A budget is a plan for your money, like a route before a road trip — you can still take detours.',
                    analogy_es: 'Un presupuesto es un plan para tu dinero, como una ruta antes de un viaje — aún puedes tomar desvíos.',
                },
                quizzes: [
                    {
                        question: 'In the 50/30/20 rule, what does the 50% cover?',
                        question_es: 'En la regla 50/30/20, ¿qué cubre el 50%?',
                        options: ['Needs', 'Wants', 'Savings', 'Vacations'],
                        options_es: ['Necesidades', 'Deseos', 'Ahorros', 'Vacaciones'],
                        correctAnswer: 'Needs',
                        correctAnswer_es: 'Necesidades',
                    },
                    {
                        question: 'What does the 20% go toward?',
                        question_es: '¿A qué se destina el 20%?',
                        options: ['Savings and paying off debt', 'Rent only', 'Entertainment only', 'Taxes only'],
                        options_es: ['Ahorro y pago de deudas', 'Solo la renta', 'Solo entretenimiento', 'Solo impuestos'],
                        correctAnswer: 'Savings and paying off debt',
                        correctAnswer_es: 'Ahorro y pago de deudas',
                    },
                    {
                        question: 'On $3,000 a month, how much is the "wants" bucket?',
                        question_es: 'Con $3,000 al mes, ¿cuánto es el grupo de "deseos"?',
                        options: ['$900', '$1,500', '$600', '$300'],
                        options_es: ['$900', '$1,500', '$600', '$300'],
                        correctAnswer: '$900',
                        correctAnswer_es: '$900',
                    },
                    {
                        question: 'The 50/30/20 percentages are based on:',
                        question_es: 'Los porcentajes 50/30/20 se basan en:',
                        options: ['Income after taxes', 'Your credit score', 'Your total debt', 'Last year’s spending only'],
                        options_es: ['El ingreso después de impuestos', 'Tu puntaje de crédito', 'Tu deuda total', 'Solo el gasto del año pasado'],
                        correctAnswer: 'Income after taxes',
                        correctAnswer_es: 'El ingreso después de impuestos',
                    },
                    {
                        question: 'Which is the smart first step before budgeting?',
                        question_es: '¿Cuál es el primer paso inteligente antes de presupuestar?',
                        options: ['Track your spending for a month', 'Take out a loan', 'Cancel all your accounts', 'Guess your expenses'],
                        options_es: ['Registrar tus gastos por un mes', 'Pedir un préstamo', 'Cancelar todas tus cuentas', 'Adivinar tus gastos'],
                        correctAnswer: 'Track your spending for a month',
                        correctAnswer_es: 'Registrar tus gastos por un mes',
                    },
                ],
            },
        ],
    },

    // ── Course 2: Introduction to Investing ──────────────────────────────────
    {
        courseTitle: 'Introduction to Investing',
        courseTitle_es: 'Introducción a la Inversión',
        courseDescription: 'Understand the building blocks of the market before you buy your first share.',
        courseDescription_es: 'Comprende los pilares del mercado antes de comprar tu primera acción.',
        estimatedTime: 45,
        difficultyLevel: 'Beginner',
        difficultyLevel_es: 'Principiante',
        lessons: [
            {
                lessonTitle: 'Stocks vs. Bonds',
                lessonTitle_es: 'Acciones vs. Bonos',
                lessonContent:
                    'A stock is a small piece of ownership in a company. A bond is a loan you make to a company or government that pays you interest. Stocks can grow more but swing harder; bonds are steadier but usually grow less.',
                lessonContent_es:
                    'Una acción es una pequeña parte de propiedad en una empresa. Un bono es un préstamo que le haces a una empresa o gobierno que te paga intereses. Las acciones pueden crecer más pero fluctúan más; los bonos son más estables pero suelen crecer menos.',
                currencyReward: 700,
                tip: {
                    tipContent: 'Owning a stock makes you a part-owner; owning a bond makes you a lender.',
                    tipContent_es: 'Tener una acción te hace copropietario; tener un bono te hace prestamista.',
                },
                example: {
                    scenario: 'Buy one share of a company and you own a tiny slice of everything it earns.',
                    scenario_es: 'Compra una acción de una empresa y posees una pequeña parte de todo lo que gana.',
                    analogy: 'A stock is a slice of the pizza; a bond is lending the pizzeria money to be paid back with a tip.',
                    analogy_es: 'Una acción es una rebanada de la pizza; un bono es prestarle dinero a la pizzería para que te pague con propina.',
                },
                quizzes: [
                    {
                        question: 'Owning a stock means you:',
                        question_es: 'Tener una acción significa que:',
                        options: ['Own a piece of the company', 'Lent the company money', 'Work for the company', 'Owe the company money'],
                        options_es: ['Posees una parte de la empresa', 'Le prestaste dinero a la empresa', 'Trabajas para la empresa', 'Le debes dinero a la empresa'],
                        correctAnswer: 'Own a piece of the company',
                        correctAnswer_es: 'Posees una parte de la empresa',
                    },
                    {
                        question: 'A bond is best described as:',
                        question_es: 'Un bono se describe mejor como:',
                        options: ['A loan that pays interest', 'Ownership of a company', 'A type of savings account', 'A tax refund'],
                        options_es: ['Un préstamo que paga intereses', 'Propiedad de una empresa', 'Un tipo de cuenta de ahorros', 'Un reembolso de impuestos'],
                        correctAnswer: 'A loan that pays interest',
                        correctAnswer_es: 'Un préstamo que paga intereses',
                    },
                    {
                        question: 'Compared to bonds, stocks are generally:',
                        question_es: 'Comparadas con los bonos, las acciones generalmente son:',
                        options: ['More volatile but higher growth', 'Always safer', 'Guaranteed to pay interest', 'Free of any risk'],
                        options_es: ['Más volátiles pero de mayor crecimiento', 'Siempre más seguras', 'Garantizadas a pagar intereses', 'Libres de todo riesgo'],
                        correctAnswer: 'More volatile but higher growth',
                        correctAnswer_es: 'Más volátiles pero de mayor crecimiento',
                    },
                    {
                        question: 'When you buy a government bond, you are:',
                        question_es: 'Cuando compras un bono del gobierno, eres:',
                        options: ['A lender to the government', 'An owner of the government', 'An employee of the government', 'A taxpayer only'],
                        options_es: ['Un prestamista del gobierno', 'Un dueño del gobierno', 'Un empleado del gobierno', 'Solo un contribuyente'],
                        correctAnswer: 'A lender to the government',
                        correctAnswer_es: 'Un prestamista del gobierno',
                    },
                    {
                        question: 'Which pair is correctly matched?',
                        question_es: '¿Cuál par está correctamente emparejado?',
                        options: ['Stock = ownership, Bond = loan', 'Stock = loan, Bond = ownership', 'Both are loans', 'Both are ownership'],
                        options_es: ['Acción = propiedad, Bono = préstamo', 'Acción = préstamo, Bono = propiedad', 'Ambos son préstamos', 'Ambos son propiedad'],
                        correctAnswer: 'Stock = ownership, Bond = loan',
                        correctAnswer_es: 'Acción = propiedad, Bono = préstamo',
                    },
                ],
            },
            {
                lessonTitle: 'What Is an Index Fund?',
                lessonTitle_es: '¿Qué es un Fondo Indexado?',
                lessonContent:
                    'An index fund holds a little of every company in a market index, like the S&P 500. Instead of betting on one stock, you own the whole basket, which spreads out risk and keeps fees low.',
                lessonContent_es:
                    'Un fondo indexado tiene un poco de cada empresa en un índice de mercado, como el S&P 500. En lugar de apostar a una sola acción, posees toda la canasta, lo que reparte el riesgo y mantiene bajas las comisiones.',
                currencyReward: 700,
                tip: {
                    tipContent: 'Low fees matter: a fund that charges less leaves more of the growth in your pocket.',
                    tipContent_es: 'Las comisiones bajas importan: un fondo que cobra menos deja más del crecimiento en tu bolsillo.',
                },
                example: {
                    scenario: 'One share of an S&P 500 fund gives you a stake in 500 large U.S. companies at once.',
                    scenario_es: 'Una acción de un fondo del S&P 500 te da participación en 500 grandes empresas de EE. UU. a la vez.',
                    analogy: 'An index fund is a fruit basket instead of a single apple — if one fruit spoils, you still have the rest.',
                    analogy_es: 'Un fondo indexado es una canasta de frutas en vez de una sola manzana — si una se echa a perder, aún tienes las demás.',
                },
                quizzes: [
                    {
                        question: 'An index fund lets you:',
                        question_es: 'Un fondo indexado te permite:',
                        options: ['Own many companies at once', 'Bet on a single stock', 'Avoid the market entirely', 'Guarantee a profit'],
                        options_es: ['Poseer muchas empresas a la vez', 'Apostar a una sola acción', 'Evitar el mercado por completo', 'Garantizar una ganancia'],
                        correctAnswer: 'Own many companies at once',
                        correctAnswer_es: 'Poseer muchas empresas a la vez',
                    },
                    {
                        question: 'The S&P 500 tracks roughly:',
                        question_es: 'El S&P 500 sigue aproximadamente:',
                        options: ['500 large U.S. companies', '5 companies', 'Only tech startups', 'Every company on Earth'],
                        options_es: ['500 grandes empresas de EE. UU.', '5 empresas', 'Solo startups de tecnología', 'Todas las empresas del mundo'],
                        correctAnswer: '500 large U.S. companies',
                        correctAnswer_es: '500 grandes empresas de EE. UU.',
                    },
                    {
                        question: 'A key advantage of index funds is:',
                        question_es: 'Una ventaja clave de los fondos indexados es:',
                        options: ['Built-in diversification', 'A guaranteed 10% return', 'No risk at all', 'They never lose value'],
                        options_es: ['Diversificación incorporada', 'Un rendimiento garantizado del 10%', 'Ningún riesgo', 'Nunca pierden valor'],
                        correctAnswer: 'Built-in diversification',
                        correctAnswer_es: 'Diversificación incorporada',
                    },
                    {
                        question: 'Why do low fees matter over time?',
                        question_es: '¿Por qué importan las comisiones bajas con el tiempo?',
                        options: ['More of your growth stays yours', 'Fees are always refunded', 'High fees guarantee returns', 'Fees do not affect anything'],
                        options_es: ['Más de tu crecimiento sigue siendo tuyo', 'Las comisiones siempre se reembolsan', 'Las comisiones altas garantizan rendimientos', 'Las comisiones no afectan nada'],
                        correctAnswer: 'More of your growth stays yours',
                        correctAnswer_es: 'Más de tu crecimiento sigue siendo tuyo',
                    },
                    {
                        question: 'Buying one stock instead of an index fund means:',
                        question_es: 'Comprar una sola acción en vez de un fondo indexado significa:',
                        options: ['More risk from that one company', 'Automatic diversification', 'Lower risk always', 'You own the whole market'],
                        options_es: ['Más riesgo de esa sola empresa', 'Diversificación automática', 'Siempre menor riesgo', 'Posees todo el mercado'],
                        correctAnswer: 'More risk from that one company',
                        correctAnswer_es: 'Más riesgo de esa sola empresa',
                    },
                ],
            },
            {
                lessonTitle: 'Risk and Diversification',
                lessonTitle_es: 'Riesgo y Diversificación',
                lessonContent:
                    'Risk is the chance an investment loses value. Diversification — spreading money across many investments — lowers the damage any single loss can do. It does not remove risk, it manages it.',
                lessonContent_es:
                    'El riesgo es la posibilidad de que una inversión pierda valor. La diversificación — repartir el dinero entre muchas inversiones — reduce el daño que puede causar una sola pérdida. No elimina el riesgo, lo administra.',
                currencyReward: 800,
                tip: {
                    tipContent: 'Do not put all your money in one stock — one bad year could wipe out years of savings.',
                    tipContent_es: 'No pongas todo tu dinero en una sola acción — un mal año podría borrar años de ahorro.',
                },
                example: {
                    scenario: 'If one stock in a 20-stock portfolio drops 50%, your total only falls about 2.5%.',
                    scenario_es: 'Si una acción en una cartera de 20 cae 50%, tu total solo baja alrededor de 2.5%.',
                    analogy: 'Diversifying is not carrying all your eggs in one basket — drop one, the rest survive.',
                    analogy_es: 'Diversificar es no llevar todos los huevos en una canasta — si se cae una, los demás sobreviven.',
                },
                quizzes: [
                    {
                        question: 'In investing, "risk" means:',
                        question_es: 'En la inversión, "riesgo" significa:',
                        options: ['The chance of losing value', 'A guaranteed loss', 'A type of bond', 'The fee a broker charges'],
                        options_es: ['La posibilidad de perder valor', 'Una pérdida garantizada', 'Un tipo de bono', 'La comisión que cobra un corredor'],
                        correctAnswer: 'The chance of losing value',
                        correctAnswer_es: 'La posibilidad de perder valor',
                    },
                    {
                        question: 'Diversification means:',
                        question_es: 'Diversificar significa:',
                        options: ['Spreading money across many investments', 'Putting everything in one stock', 'Never investing', 'Only buying bonds'],
                        options_es: ['Repartir el dinero entre muchas inversiones', 'Poner todo en una sola acción', 'Nunca invertir', 'Comprar solo bonos'],
                        correctAnswer: 'Spreading money across many investments',
                        correctAnswer_es: 'Repartir el dinero entre muchas inversiones',
                    },
                    {
                        question: 'Diversification does what to risk?',
                        question_es: '¿Qué le hace la diversificación al riesgo?',
                        options: ['Reduces it but does not remove it', 'Removes it completely', 'Increases it', 'Has no effect'],
                        options_es: ['Lo reduce pero no lo elimina', 'Lo elimina por completo', 'Lo aumenta', 'No tiene efecto'],
                        correctAnswer: 'Reduces it but does not remove it',
                        correctAnswer_es: 'Lo reduce pero no lo elimina',
                    },
                    {
                        question: 'Which portfolio is best diversified?',
                        question_es: '¿Cuál cartera está mejor diversificada?',
                        options: ['Many different companies', 'One single stock', 'Cash under a mattress', 'One company’s stock split in two accounts'],
                        options_es: ['Muchas empresas diferentes', 'Una sola acción', 'Efectivo bajo el colchón', 'La acción de una empresa dividida en dos cuentas'],
                        correctAnswer: 'Many different companies',
                        correctAnswer_es: 'Muchas empresas diferentes',
                    },
                    {
                        question: 'The saying about diversification is:',
                        question_es: 'El dicho sobre la diversificación es:',
                        options: ['Do not put all your eggs in one basket', 'Buy low, cry high', 'Cash is always king', 'More risk, more safety'],
                        options_es: ['No pongas todos los huevos en una canasta', 'Compra bajo, llora alto', 'El efectivo siempre reina', 'Más riesgo, más seguridad'],
                        correctAnswer: 'Do not put all your eggs in one basket',
                        correctAnswer_es: 'No pongas todos los huevos en una canasta',
                    },
                ],
            },
        ],
    },

    // ── Course 3: Growing Your Wealth ─────────────────────────────────────────
    {
        courseTitle: 'Growing Your Wealth',
        courseTitle_es: 'Haciendo Crecer tu Patrimonio',
        courseDescription: 'The forces that quietly build — or erode — money over decades.',
        courseDescription_es: 'Las fuerzas que silenciosamente construyen — o erosionan — el dinero durante décadas.',
        estimatedTime: 50,
        difficultyLevel: 'Intermediate',
        difficultyLevel_es: 'Intermedio',
        lessons: [
            {
                lessonTitle: 'The Power of Compound Interest',
                lessonTitle_es: 'El Poder del Interés Compuesto',
                lessonContent:
                    'Compound interest is earning interest on your interest. Over time it snowballs: the earlier you start, the more the growth builds on itself. Time is the biggest lever.',
                lessonContent_es:
                    'El interés compuesto es ganar interés sobre tu interés. Con el tiempo se acumula como bola de nieve: cuanto antes empieces, más se construye el crecimiento sobre sí mismo. El tiempo es la mayor palanca.',
                currencyReward: 900,
                tip: {
                    tipContent: 'Starting to invest at 25 instead of 35 can double your final total, thanks to compounding.',
                    tipContent_es: 'Empezar a invertir a los 25 en vez de a los 35 puede duplicar tu total final, gracias al interés compuesto.',
                },
                example: {
                    scenario: '$1,000 at 8% becomes about $2,159 in 10 years without adding a cent.',
                    scenario_es: '$1,000 al 8% se convierte en unos $2,159 en 10 años sin agregar un centavo.',
                    analogy: 'Compounding is a snowball rolling downhill — small at first, then unstoppable.',
                    analogy_es: 'El interés compuesto es una bola de nieve cuesta abajo — pequeña al principio, luego imparable.',
                },
                quizzes: [
                    {
                        question: 'Compound interest means you earn interest on:',
                        question_es: 'El interés compuesto significa que ganas interés sobre:',
                        options: ['Your principal and your past interest', 'Only your original deposit', 'Only the bank’s fees', 'Nothing until you withdraw'],
                        options_es: ['Tu capital y tu interés anterior', 'Solo tu depósito original', 'Solo las comisiones del banco', 'Nada hasta que retiras'],
                        correctAnswer: 'Your principal and your past interest',
                        correctAnswer_es: 'Tu capital y tu interés anterior',
                    },
                    {
                        question: 'The most powerful ingredient in compounding is:',
                        question_es: 'El ingrediente más poderoso del interés compuesto es:',
                        options: ['Time', 'Luck', 'A high salary', 'A big bank'],
                        options_es: ['El tiempo', 'La suerte', 'Un salario alto', 'Un banco grande'],
                        correctAnswer: 'Time',
                        correctAnswer_es: 'El tiempo',
                    },
                    {
                        question: 'Starting to invest earlier generally leads to:',
                        question_es: 'Empezar a invertir antes generalmente lleva a:',
                        options: ['A larger final amount', 'A smaller final amount', 'No difference', 'Guaranteed losses'],
                        options_es: ['Un monto final mayor', 'Un monto final menor', 'Ninguna diferencia', 'Pérdidas garantizadas'],
                        correctAnswer: 'A larger final amount',
                        correctAnswer_es: 'Un monto final mayor',
                    },
                    {
                        question: '$1,000 growing at 8% for 10 years becomes about:',
                        question_es: '$1,000 creciendo al 8% durante 10 años se convierte en aproximadamente:',
                        options: ['$2,159', '$1,080', '$1,800', '$10,000'],
                        options_es: ['$2,159', '$1,080', '$1,800', '$10,000'],
                        correctAnswer: '$2,159',
                        correctAnswer_es: '$2,159',
                    },
                    {
                        question: 'Compounding is often compared to:',
                        question_es: 'El interés compuesto suele compararse con:',
                        options: ['A snowball rolling downhill', 'A candle burning out', 'A leaking bucket', 'A flat tire'],
                        options_es: ['Una bola de nieve cuesta abajo', 'Una vela que se apaga', 'Una cubeta con fuga', 'Una llanta desinflada'],
                        correctAnswer: 'A snowball rolling downhill',
                        correctAnswer_es: 'Una bola de nieve cuesta abajo',
                    },
                ],
            },
            {
                lessonTitle: 'Retirement Accounts: 401(k) and IRA',
                lessonTitle_es: 'Cuentas de Retiro: 401(k) e IRA',
                lessonContent:
                    'A 401(k) is a retirement account through your employer, often with matching contributions. An IRA is one you open yourself. Both give tax advantages to reward long-term saving.',
                lessonContent_es:
                    'Un 401(k) es una cuenta de retiro a través de tu empleador, a menudo con aportaciones equivalentes. Una IRA es una que abres tú mismo. Ambas ofrecen ventajas fiscales para premiar el ahorro a largo plazo.',
                currencyReward: 900,
                tip: {
                    tipContent: 'If your employer matches your 401(k), contribute at least enough to get the full match — it is free money.',
                    tipContent_es: 'Si tu empleador iguala tu 401(k), aporta al menos lo suficiente para obtener el máximo — es dinero gratis.',
                },
                example: {
                    scenario: 'A 50% match on your first $4,000 adds $2,000 to your retirement each year, for free.',
                    scenario_es: 'Un aporte del 50% sobre tus primeros $4,000 agrega $2,000 a tu retiro cada año, gratis.',
                    analogy: 'An employer match is a coworker chipping in on your savings just for saving.',
                    analogy_es: 'El aporte del empleador es un compañero que contribuye a tus ahorros solo por ahorrar.',
                },
                quizzes: [
                    {
                        question: 'A 401(k) is typically offered through:',
                        question_es: 'Un 401(k) generalmente se ofrece a través de:',
                        options: ['Your employer', 'Your grocery store', 'The stock exchange directly', 'A credit card company'],
                        options_es: ['Tu empleador', 'Tu supermercado', 'La bolsa de valores directamente', 'Una compañía de tarjetas de crédito'],
                        correctAnswer: 'Your employer',
                        correctAnswer_es: 'Tu empleador',
                    },
                    {
                        question: 'An IRA is an account that:',
                        question_es: 'Una IRA es una cuenta que:',
                        options: ['You open on your own', 'Only employers can open', 'Requires no saving', 'Pays no tax benefit'],
                        options_es: ['Abres por tu cuenta', 'Solo los empleadores pueden abrir', 'No requiere ahorrar', 'No da beneficio fiscal'],
                        correctAnswer: 'You open on your own',
                        correctAnswer_es: 'Abres por tu cuenta',
                    },
                    {
                        question: 'An employer "match" means:',
                        question_es: 'Un "aporte equivalente" del empleador significa:',
                        options: ['They add money based on what you contribute', 'They take a fee from your pay', 'They pick your stocks', 'They tax your savings'],
                        options_es: ['Agregan dinero según lo que tú aportas', 'Cobran una comisión de tu sueldo', 'Eligen tus acciones', 'Gravan tus ahorros'],
                        correctAnswer: 'They add money based on what you contribute',
                        correctAnswer_es: 'Agregan dinero según lo que tú aportas',
                    },
                    {
                        question: 'Why do these accounts exist?',
                        question_es: '¿Por qué existen estas cuentas?',
                        options: ['To reward long-term saving with tax advantages', 'To make banks richer', 'To avoid all investing', 'To replace an emergency fund'],
                        options_es: ['Para premiar el ahorro a largo plazo con ventajas fiscales', 'Para hacer más ricos a los bancos', 'Para evitar toda inversión', 'Para reemplazar un fondo de emergencia'],
                        correctAnswer: 'To reward long-term saving with tax advantages',
                        correctAnswer_es: 'Para premiar el ahorro a largo plazo con ventajas fiscales',
                    },
                    {
                        question: 'With a 50% match on your first $4,000, the employer adds:',
                        question_es: 'Con un aporte del 50% sobre tus primeros $4,000, el empleador agrega:',
                        options: ['$2,000', '$4,000', '$400', '$0'],
                        options_es: ['$2,000', '$4,000', '$400', '$0'],
                        correctAnswer: '$2,000',
                        correctAnswer_es: '$2,000',
                    },
                ],
            },
            {
                lessonTitle: 'Understanding Inflation',
                lessonTitle_es: 'Entendiendo la Inflación',
                lessonContent:
                    'Inflation is the gradual rise in prices over time, which means each dollar buys a little less. Money left as idle cash slowly loses purchasing power, which is why people invest to stay ahead of it.',
                lessonContent_es:
                    'La inflación es el aumento gradual de los precios con el tiempo, lo que significa que cada dólar compra un poco menos. El dinero que se deja como efectivo inactivo pierde poder adquisitivo lentamente, por eso la gente invierte para adelantarse a ella.',
                currencyReward: 1000,
                tip: {
                    tipContent: 'If inflation is 3% and your savings earn 1%, you are quietly losing 2% of buying power a year.',
                    tipContent_es: 'Si la inflación es 3% y tus ahorros ganan 1%, pierdes silenciosamente 2% de poder de compra al año.',
                },
                example: {
                    scenario: 'At 3% inflation, something that costs $100 today costs about $134 in 10 years.',
                    scenario_es: 'Con 3% de inflación, algo que cuesta $100 hoy costará unos $134 en 10 años.',
                    analogy: 'Inflation is a slow leak in a tire — you do not notice it daily, but the pressure keeps dropping.',
                    analogy_es: 'La inflación es una fuga lenta en una llanta — no la notas a diario, pero la presión sigue bajando.',
                },
                quizzes: [
                    {
                        question: 'Inflation is:',
                        question_es: 'La inflación es:',
                        options: ['The gradual rise in prices', 'A drop in prices', 'A type of tax', 'A kind of bond'],
                        options_es: ['El aumento gradual de los precios', 'Una caída de los precios', 'Un tipo de impuesto', 'Una clase de bono'],
                        correctAnswer: 'The gradual rise in prices',
                        correctAnswer_es: 'El aumento gradual de los precios',
                    },
                    {
                        question: 'When there is inflation, each dollar:',
                        question_es: 'Cuando hay inflación, cada dólar:',
                        options: ['Buys a little less over time', 'Buys more over time', 'Stays exactly the same', 'Becomes counterfeit'],
                        options_es: ['Compra un poco menos con el tiempo', 'Compra más con el tiempo', 'Permanece exactamente igual', 'Se vuelve falso'],
                        correctAnswer: 'Buys a little less over time',
                        correctAnswer_es: 'Compra un poco menos con el tiempo',
                    },
                    {
                        question: 'Why do people invest instead of holding only cash?',
                        question_es: '¿Por qué la gente invierte en lugar de guardar solo efectivo?',
                        options: ['To stay ahead of inflation', 'To avoid all banks', 'To pay more taxes', 'To lose purchasing power faster'],
                        options_es: ['Para adelantarse a la inflación', 'Para evitar todos los bancos', 'Para pagar más impuestos', 'Para perder poder adquisitivo más rápido'],
                        correctAnswer: 'To stay ahead of inflation',
                        correctAnswer_es: 'Para adelantarse a la inflación',
                    },
                    {
                        question: 'If inflation is 3% and your savings earn 1%, you are:',
                        question_es: 'Si la inflación es 3% y tus ahorros ganan 1%, estás:',
                        options: ['Losing about 2% of buying power a year', 'Gaining 4% a year', 'Breaking even', 'Doubling your money'],
                        options_es: ['Perdiendo cerca del 2% de poder de compra al año', 'Ganando 4% al año', 'Quedando igual', 'Duplicando tu dinero'],
                        correctAnswer: 'Losing about 2% of buying power a year',
                        correctAnswer_es: 'Perdiendo cerca del 2% de poder de compra al año',
                    },
                    {
                        question: 'At 3% inflation, $100 today costs about how much in 10 years?',
                        question_es: 'Con 3% de inflación, ¿cuánto costará en 10 años algo que hoy vale $100?',
                        options: ['$134', '$103', '$70', '$300'],
                        options_es: ['$134', '$103', '$70', '$300'],
                        correctAnswer: '$134',
                        correctAnswer_es: '$134',
                    },
                ],
            },
        ],
    },
];

// ─── The 10 curated trading assets ───────────────────────────────────────────
// Seeded, never user-created. Ready for the Trading engine.
const assets = [
    { ticker: 'VOO', name: 'Vanguard S&P 500 ETF', name_es: 'ETF Vanguard S&P 500' },
    { ticker: 'VTI', name: 'Vanguard Total Stock Market ETF', name_es: 'ETF Vanguard Mercado Total' },
    { ticker: 'BND', name: 'Vanguard Total Bond Market ETF', name_es: 'ETF Vanguard Mercado Total de Bonos' },
    { ticker: 'AAPL', name: 'Apple Inc.', name_es: 'Apple Inc.' },
    { ticker: 'MSFT', name: 'Microsoft Corporation', name_es: 'Microsoft Corporation' },
    { ticker: 'AMZN', name: 'Amazon.com, Inc.', name_es: 'Amazon.com, Inc.' },
    { ticker: 'GOOGL', name: 'Alphabet Inc.', name_es: 'Alphabet Inc.' },
    { ticker: 'NVDA', name: 'NVIDIA Corporation', name_es: 'NVIDIA Corporation' },
    { ticker: 'TSLA', name: 'Tesla, Inc.', name_es: 'Tesla, Inc.' },
    { ticker: 'JNJ', name: 'Johnson & Johnson', name_es: 'Johnson & Johnson' },
];

// ─── Validation ──────────────────────────────────────────────────────────────
// Quiz.tsx compares the selected option string against correctAnswer and renders
// options with key={option}. So a quiz is only winnable if it has exactly 5
// questions, 4 unique options, and correctAnswer is one of those options — in
// BOTH languages. A typo here produces a silently unbeatable quiz, so we fail
// the seed loudly at build time instead of discovering it in the UI.
function validate() {
    for (const course of courses) {
        for (const lesson of course.lessons) {
            const where = `"${course.courseTitle}" → "${lesson.lessonTitle}"`;
            if (lesson.quizzes.length !== 5) {
                throw new Error(`${where}: has ${lesson.quizzes.length} questions, expected 5.`);
            }
            for (const q of lesson.quizzes) {
                for (const [lang, opts, answer] of [
                    ['en', q.options, q.correctAnswer],
                    ['es', q.options_es, q.correctAnswer_es],
                ] as const) {
                    if (opts.length !== 4) {
                        throw new Error(`${where} [${lang}] "${q.question}": has ${opts.length} options, expected 4.`);
                    }
                    if (new Set(opts).size !== opts.length) {
                        throw new Error(`${where} [${lang}] "${q.question}": options are not unique.`);
                    }
                    if (!opts.includes(answer)) {
                        throw new Error(`${where} [${lang}] "${q.question}": correctAnswer "${answer}" is not one of the options.`);
                    }
                }
            }
        }
    }
}

const load = async () => {
    try {
        await main();
    } catch (e) {
        console.error(e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
};

async function main() {
    validate();

    // Wipe EdTech content in FK-safe order (children before parents) so the seed
    // is idempotent: re-running always reflects the content defined above.
    await prisma.quiz.deleteMany();
    await prisma.tip.deleteMany();
    await prisma.calculator.deleteMany();
    await prisma.example.deleteMany();
    await prisma.userLessonProgress.deleteMany();
    await prisma.lesson.deleteMany();
    await prisma.course.deleteMany();

    for (const course of courses) {
        const created = await prisma.course.create({
            data: {
                courseTitle: course.courseTitle,
                courseTitle_es: course.courseTitle_es,
                courseDescription: course.courseDescription,
                courseDescription_es: course.courseDescription_es,
                estimatedTime: course.estimatedTime,
                difficultyLevel: course.difficultyLevel,
                difficultyLevel_es: course.difficultyLevel_es,
                lessons: {
                    create: course.lessons.map((lesson) => ({
                        lessonTitle: lesson.lessonTitle,
                        lessonTitle_es: lesson.lessonTitle_es,
                        lessonContent: lesson.lessonContent,
                        lessonContent_es: lesson.lessonContent_es,
                        currencyReward: lesson.currencyReward,
                        quizzes: { create: lesson.quizzes },
                        tips: { create: lesson.tip },
                        examples: { create: lesson.example },
                    })),
                },
            },
        });
        console.log(`Created course: ${created.courseTitle} (${course.lessons.length} lessons)`);
    }

    // Trading assets are seeded independently of the EdTech content. upsert on the
    // unique ticker keeps this idempotent without wiping Holdings/Trades that may
    // reference an asset (those FKs would block a deleteMany anyway).
    for (const asset of assets) {
        await prisma.asset.upsert({
            where: { ticker: asset.ticker },
            update: { name: asset.name, name_es: asset.name_es },
            create: asset,
        });
    }
    console.log(`Upserted ${assets.length} trading assets.`);
}

load();
