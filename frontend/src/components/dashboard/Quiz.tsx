"use client";

import { useState, useEffect } from "react";
import { Quiz as QuizModel } from "../../generated/prisma";
import { awardLessonReward } from "@/app/actions/quiz";

interface Props {
    language?: "en" | "es";
    questions: QuizModel[];
    lessonId: number;
}

export default function Quiz({ language = "en", questions, lessonId }: Props) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [score, setScore] = useState(0);
    const [isQuizCompleted, setIsQuizCompleted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [receivedReward, setReceivedReward] = useState(false);

    const currentQuestion = questions[currentQuestionIndex];
    const correctAnswer = language === "en" ? currentQuestion.correctAnswer : currentQuestion.correctAnswer_es;
    const passed = score === questions.length;

    function shuffle<T>(array: T[]): T[] {
        const shuffledArray = [...array];
        for (let i = shuffledArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
        }
        return shuffledArray;
    }

    // Shuffle options client-side only. Running the shuffle during render (or in
    // useMemo) would call Math.random() during SSR and again on hydration, giving
    // the server and client different orders -> hydration mismatch. An effect never
    // runs on the server, so the initial render uses the raw order on both sides,
    // then we re-shuffle after mount.
    const [displayedOptions, setDisplayedOptions] = useState<string[]>(
        language === "en" ? currentQuestion.options : currentQuestion.options_es
    );

    useEffect(() => {
        setDisplayedOptions(shuffle(language === "en" ? currentQuestion.options : currentQuestion.options_es));
    }, [currentQuestion, language]);

    const handleSubmitAnswer = async () => {
        if (selectedOption === null) {
            setError("Please select an option before submitting.");
            return;
        }
        if (selectedOption === correctAnswer) {
            setScore(score + 1);
        }
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedOption(null);
        } else {
            setIsQuizCompleted(true);
        }
    };

    useEffect(() => {
        if (isQuizCompleted && passed) {
            (async () => {
                setIsLoading(true);
                try {
                    const result = await awardLessonReward(lessonId);
                    if (result.awarded) {
                        setReceivedReward(true);
                    }
                } catch {
                    setError("An error occurred while awarding the reward. Please try again later.");
                } finally {
                setIsLoading(false);
                }
            })();
        }
    }, [isQuizCompleted, lessonId, passed]);

    const handleRetry = () => {
        setCurrentQuestionIndex(0);
        setSelectedOption(null);
        setScore(0);
        setIsQuizCompleted(false);
        setError(null);
    }

    useEffect(() => {
        if (!error) return

        // Clear error after 3000 milliseconds (3 seconds)
        const timer = setTimeout(() => {
            setError(null)
        }, 3000)

        // Cleanup the timer if component unmounts or error changes
        return () => clearTimeout(timer)
    }, [error])

    return (
        <>
            <div>
                {isQuizCompleted ? (
                    <div>
                        <h2>Quiz Completed!</h2>
                        <div>
                            {!passed ? (
                                <div>
                                    <p>You did not pass the quiz. Please try again for a chance to earn the reward.</p>
                                    <button onClick={handleRetry}>Retry Quiz</button>
                                </div>
                            ) : (
                                <div>
                                    {isLoading ? (
                                        <p>Awarding reward...</p>
                                    ) : receivedReward ? (
                                        <p>Congratulations! You have earned the reward for completing this lesson.</p>

                                    ) : (
                                        <p>Reward not granted. You may have already completed this lesson.</p>
                                    )}
                                    <h2>Correct Answers</h2>
                                            <ul>
                                                {questions.map((question) => (
                                                    <li key={question.id}>
                                                        {language === "en" ? question.question : question.question_es}
                                                        <p>Correct answer: {language === "en" ? question.correctAnswer : question.correctAnswer_es}</p>
                                                    </li>
                                                ))}
                                            </ul>
                                </div>
                            )}
                        </div>
                        <p>Your score: {score} out of {questions.length}</p>
                    </div>
                ) : (
                    <div>
                        <h2>{language === "en" ? currentQuestion.question : currentQuestion.question_es}</h2>
                        <ul>
                            {displayedOptions.map((option) => (
                                <li key={option}>
                                    <button onClick={() => setSelectedOption(option)}>
                                        {selectedOption === option ? <strong>{option}</strong> : option}
                                    </button>
                                </li>
                            ))}
                        </ul>

                        <button onClick={handleSubmitAnswer} disabled={isLoading}>
                            Submit
                        </button>
                        <p>{error && <span style={{ color: "red" }}>{error}</span>}</p>
                    </div>
                )}
            </div>
        </>
    );
}