import { PrismaClient } from '../src/generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg';

const connectionString = process.env.DATABASE_URL as string;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const load = async () => {
  try {
    await main()
  } catch (e) {
    console.error(e)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
};

async function main() {
    const newUser = await prisma.user.upsert({
        where: { email: 'alice@prisma.io' },
        update: {},
        create: { 
            email: 'alice@prisma.io',
            name: 'Alice',
        }
    });
    console.log(`Upserted user: ${newUser.name} (${newUser.email})`);

    const course1 = await prisma.course.upsert({
            where: { id: 1 },
            update: {},
            create: {
                courseTitle: 'Introduction to Saving',
                courseTitle_es: 'Introducción al Ahorro',
                courseDescription: 'Learn the basics of saving money effectively.',
                courseDescription_es: 'Aprende los conceptos básicos para ahorrar dinero de manera efectiva.',
                estimatedTime: 30,
                difficultyLevel: 'Beginner',
                difficultyLevel_es: 'Principiante',
                lessons: {
                    create: [
                    {
                        lessonTitle: 'Why Save Money?',
                        lessonTitle_es: '¿Por qué ahorrar dinero?',
                        lessonContent: 'Saving money is essential for financial security...',
                        lessonContent_es: 'Ahorrar dinero es esencial para la seguridad financiera...',
                        quizzes: {
                            create: {
                                question: 'What is the primary reason to save money?',
                                question_es: '¿Cuál es la razón principal para ahorrar dinero?',
                                options: ['For emergencies', 'To spend more', 'To impress others'],
                                options_es: ['Para emergencias', 'Para gastar más', 'Para impresionar a otros'],
                                correctAnswer: 'For emergencies',
                                correctAnswer_es: 'Para emergencias',
                            }
                        },
                        tips: {
                            create: {
                                tipContent: 'Start by saving a small portion of your income regularly.',
                                tipContent_es: 'Comienza ahorrando una pequeña parte de tus ingresos regularmente.',
                            }
                        },
                        calculators : {
                            create: {
                                calculatorType: 'Savings Goal Calculator',
                                calculatorType_es: 'Calculadora de Metas de Ahorro',
                                description: 'Helps you determine how much to save each month to reach your goal.',
                                description_es: 'Te ayuda a determinar cuánto ahorrar cada mes para alcanzar tu meta.',
                            }
                        },
                        examples : {
                            create: {
                                scenario: 'If you save $100 monthly, in one year you will have $1,200.',
                                scenario_es: 'Si ahorras $100 mensuales, en un año tendrás $1,200.',
                                analogy: 'Saving is like planting a tree; the earlier you start, the more it grows over time.',
                                analogy_es: 'Ahorrar es como plantar un árbol; cuanto antes comiences, más crecerá con el tiempo.',
                            }
                        }
                    },
                    {
                        lessonTitle: 'Setting Up a Budget',
                        lessonTitle_es: 'Estableciendo un Presupuesto',
                        lessonContent: 'Creating a budget helps you track your income and expenses...',
                        lessonContent_es: 'Crear un presupuesto te ayuda a rastrear tus ingresos y gastos...',
                        quizzes: {
                            create: {
                                question: 'What is the first step in creating a budget?',
                                question_es: '¿Cuál es el primer paso para crear un presupuesto?',
                                options: ['Track expenses', 'Set savings goals', 'Calculate income'],
                                options_es: ['Rastrear gastos', 'Establecer metas de ahorro', 'Calcular ingresos'],
                                correctAnswer: 'Calculate income',
                                correctAnswer_es: 'Calcular ingresos',
                            }
                        },
                        tips: {
                            create: {
                                tipContent: 'Use budgeting apps to simplify the tracking process.',
                                tipContent_es: 'Utiliza aplicaciones de presupuesto para simplificar el proceso de seguimiento.',
                            }
                        },
                        calculators : {
                            create: {
                                calculatorType: 'Budget Planner',
                                calculatorType_es: 'Planificador de Presupuesto',
                                description: 'Helps you allocate your income towards expenses and savings.',
                                description_es: 'Te ayuda a asignar tus ingresos hacia gastos y ahorros.',
                            }
                        },
                        examples: {
                            create: {
                                scenario: 'Allocating 50% of income to needs, 30% to wants, and 20% to savings.',
                                scenario_es: 'Asignar el 50% de los ingresos a necesidades, el 30% a deseos y el 20% a ahorros.',
                                analogy: 'A budget is like a roadmap for your money, guiding where it should go.',
                                analogy_es: 'Un presupuesto es como un mapa para tu dinero, guiando hacia dónde debe ir.',
                            }
                        }
                    }
                ]
                }
            }
    });
    console.log(`Upserted course1: ${course1.courseTitle}`);

    const course2 = await prisma.course.upsert({
        where: { id: 2 },
        update: {},
        create: {
            courseTitle: 'Basics of Investing',
            courseTitle_es: 'Conceptos Básicos de Inversión',
            courseDescription: 'An introductory course on investing in stocks and bonds.',
            courseDescription_es: 'Un curso introductorio sobre inversión en acciones y bonos.',
            estimatedTime: 45,
            difficultyLevel: 'Beginner',
            difficultyLevel_es: 'Principiante',
            lessons: {
                create: [
                    {
                        lessonTitle: 'Understanding Stocks',
                        lessonTitle_es: 'Entendiendo las Acciones',
                        lessonContent: 'Stocks represent ownership in a company...',
                        lessonContent_es: 'Las acciones representan la propiedad en una empresa...',
                        quizzes: {
                            create: {
                                question: 'What does owning a stock mean?',
                                question_es: '¿Qué significa poseer una acción?',
                                options: ['Ownership in a company', 'A loan to a company', 'A type of bond'],
                                options_es: ['Propiedad en una empresa', 'Un préstamo a una empresa', 'Un tipo de bono'],
                                correctAnswer: 'Ownership in a company',
                                correctAnswer_es: 'Propiedad en una empresa',
                            }
                        },
                        tips: {
                            create: {
                                tipContent: 'Diversify your stock portfolio to reduce risk.',
                                tipContent_es: 'Diversifica tu cartera de acciones para reducir el riesgo.',
                            }
                        },
                        examples: {
                            create: {
                                scenario: 'Buying shares of a tech company and benefiting from its growth.',
                                scenario_es: 'Comprar acciones de una empresa tecnológica y beneficiarse de su crecimiento.',
                                analogy: 'Investing in stocks is like planting seeds in a garden; with time, they can grow into fruitful plants.',
                                analogy_es: 'Invertir en acciones es como plantar semillas en un jardín; con el tiempo, pueden crecer y dar frutos.',
                            }
                        }
                    },
                    {
                        lessonTitle: 'Introduction to Bonds',
                        lessonTitle_es: 'Introducción a los Bonos',
                        lessonContent: 'Bonds are debt instruments issued by entities...',
                        lessonContent_es: 'Los bonos son instrumentos de deuda emitidos por entidades...',
                        calculators: {
                            create: {
                                calculatorType: 'Bond Yield Calculator',
                                calculatorType_es: 'Calculadora de Rendimiento de Bonos',
                                description: 'Calculates the yield of a bond based on its price and interest rate.',
                                description_es: 'Calcula el rendimiento de un bono basado en su precio y tasa de interés.',
                            }
                        }
                    }
                ]
            }
        }
    });
    console.log(`Upserted course2: ${course2.courseTitle}`);
}

load();