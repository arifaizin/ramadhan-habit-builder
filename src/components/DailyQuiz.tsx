import { useState } from 'react';
import { ExternalLink, Check, X } from 'lucide-react';
import { SAMPLE_QUIZZES, QUIZ_POINTS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DailyQuizProps {
  completed: boolean;
  savedAnswers?: { questionId: string; selectedIndex: number | null }[];
  onComplete: (answers: { questionId: string; selectedIndex: number | null }[], score: number) => void;
}

export function DailyQuiz({ completed, savedAnswers, onComplete }: DailyQuizProps) {
  const quiz = SAMPLE_QUIZZES[0]; // Using first quiz for demo
  const [answers, setAnswers] = useState<Record<string, number | null>>(
    savedAnswers?.reduce((acc, a) => ({ ...acc, [a.questionId]: a.selectedIndex }), {}) || {}
  );
  const [submitted, setSubmitted] = useState(completed);

  const handleSelectAnswer = (questionId: string, index: number) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionId]: index }));
  };

  const handleSubmit = () => {
    const answerArray = quiz.questions.map((q) => ({
      questionId: q.id,
      selectedIndex: answers[q.id] ?? null,
    }));

    // Calculate score
    let score = 0;
    for (const q of quiz.questions) {
      const selected = answers[q.id];
      if (selected === null || selected === undefined) {
        score += QUIZ_POINTS.unanswered;
      } else if (selected === q.correctIndex) {
        score += QUIZ_POINTS.correct;
      } else {
        score += QUIZ_POINTS.wrong;
      }
    }

    setSubmitted(true);
    onComplete(answerArray, score);
  };

  const allAnswered = quiz.questions.every(
    (q) => answers[q.id] !== undefined && answers[q.id] !== null
  );

  return (
    <div className="card-elevated p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Quiz Kajian Harian</h3>
        {submitted && (
          <span className="badge-level text-xs">Selesai ✓</span>
        )}
      </div>

      {/* Video Link */}
      <a
        href={quiz.videoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors mb-4"
      >
        <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
          <span className="text-lg">▶️</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {quiz.videoTitle}
          </p>
          <p className="text-xs text-muted-foreground">Tonton dulu sebelum menjawab</p>
        </div>
        <ExternalLink className="w-4 h-4 text-muted-foreground" />
      </a>

      {/* Questions */}
      <div className="space-y-5">
        {quiz.questions.map((question, qIndex) => {
          const selectedAnswer = answers[question.id];
          const isCorrect = submitted && selectedAnswer === question.correctIndex;
          const isWrong = submitted && selectedAnswer !== null && selectedAnswer !== question.correctIndex;

          return (
            <div key={question.id} className="space-y-2.5">
              <p className="text-sm font-medium text-foreground">
                {qIndex + 1}. {question.question}
              </p>
              <div className="space-y-2">
                {question.options.map((option, oIndex) => {
                  const isSelected = selectedAnswer === oIndex;
                  const isCorrectOption = question.correctIndex === oIndex;

                  return (
                    <button
                      key={oIndex}
                      type="button"
                      onClick={() => handleSelectAnswer(question.id, oIndex)}
                      disabled={submitted}
                      className={cn(
                        'w-full p-3 rounded-lg border text-left text-sm transition-all duration-200',
                        !submitted && isSelected && 'border-primary bg-primary/5',
                        !submitted && !isSelected && 'border-border hover:border-primary/50',
                        submitted && isCorrectOption && 'border-success bg-success/10',
                        submitted && isSelected && !isCorrectOption && 'border-destructive bg-destructive/10',
                        submitted && 'cursor-default'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className="flex-1">{option}</span>
                        {submitted && isCorrectOption && (
                          <Check className="w-4 h-4 text-success" />
                        )}
                        {submitted && isSelected && !isCorrectOption && (
                          <X className="w-4 h-4 text-destructive" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
              {submitted && (
                <p className={cn(
                  'text-xs font-medium',
                  isCorrect ? 'text-success' : isWrong ? 'text-destructive' : 'text-muted-foreground'
                )}>
                  {isCorrect
                    ? `+${QUIZ_POINTS.correct} poin`
                    : isWrong
                    ? `+${QUIZ_POINTS.wrong} poin (salah)`
                    : `+${QUIZ_POINTS.unanswered} poin (tidak dijawab)`}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit Button */}
      {!submitted && (
        <Button
          onClick={handleSubmit}
          className="w-full btn-primary mt-5"
          disabled={!allAnswered}
        >
          Kirim Jawaban
        </Button>
      )}
    </div>
  );
}
