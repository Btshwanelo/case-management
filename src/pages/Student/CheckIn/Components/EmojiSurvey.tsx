import React, { useEffect, useState } from 'react';
import { ArrowLeft, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useSurveyResponseAnswerMutation, useSurveyResponseMutation } from '@/services/apiService';
import { useParams, useSearchParams } from 'react-router-dom';
import { Spinner } from '@/components/ui/spinner';
import { showErrorToast } from '@/components/ErrorToast ';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import ErrorPage from '@/components/ErrorPage';

const EmojiSurvey = ({ onClose, onNextStep, onBack }) => {
  const [selectedRating, setSelectedRating] = useState(null);
  const [searchParams] = useSearchParams();
  const surveyresponseId = searchParams.get('surveyresponseId');
  const { id: checkInId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [hasError, setHasError] = useState(false);

  const ratings = [
    { emoji: '😢', label: 'Very Unhappy', value: 0 },
    { emoji: '☹️', label: 'Unhappy', value: 1 },
    { emoji: '😐', label: 'Neutral', value: 2 },
    { emoji: '😊', label: 'Happy', value: 3 },
    { emoji: '😊', label: 'Very happy', value: 4 },
  ];

  const [surveyResponseAnswer, { isLoading: isLoadingAnswer }] = useSurveyResponseAnswerMutation();
  const [surveyResponse, { isLoading: isLoadingSurvey }] = useSurveyResponseMutation();

  const handleResponse = async (score) => {
    try {
      const response = await surveyResponseAnswer({
        body: {
          entityName: 'SurveyResponseAnswer',
          requestName: 'UpsertRecordReq',
          inputParamters: {
            Entity: {
              SurveyQuestionId: questions[questionIndex].possibleAnswers[score].surveyQuestionId,
              SurveyQuestionAnswerId: questions[questionIndex].possibleAnswers[score].surveyQuestionAnswerId,
              AnswerSingleLine: '',
              AnswerMultiLine: '',
              Score: score,
              RegardingId: checkInId,
              RegardingIdObjectTypeCode: 'CheckIn',
              SurveyResponseId: surveyresponseId,
              // SurveyResponseId: surveyresponseId,
            },
          },
        },
      }).unwrap();

      // Handle successful response
      setSelectedRating(score);
      setQuestionIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        if (nextIndex >= questions.length) {
          onNextStep();
        }
        return nextIndex;
      });
    } catch (err) {
      // setHasError(true);
      const errorMessage = err?.data?.title || err?.data?.errors?.[0] || 'Failed to submit answer. Please try again.';
      showErrorToast(errorMessage);
    }
  };

  const fetchSurveyQuestions = async () => {
    try {
      const response = await surveyResponse({
        body: {
          entityName: 'SurveyResponse',
          recordId: surveyresponseId,
          requestName: 'GetSurveyExecuteRequest',
        },
      }).unwrap();

      const questionData =
        response?.Response?.survey?.topics[0]?.questions?.map((q) => ({
          titleText: q.question,
          answerTypeId: q.answerTypeId,
          possibleAnswers: q.possibleAnswers,
        })) || [];

      setQuestions(questionData);
      setHasError(false);
    } catch (err) {
      setHasError(true);
      const errorMessage = err?.data?.title || err?.data?.errors?.[0] || 'Failed to load survey questions. Please try again.';
      showErrorToast(errorMessage);
    }
  };

  useEffect(() => {
    fetchSurveyQuestions();
  }, []);

  const progressValue = Math.min(100, Math.max(0, (8 / 10) * 100));

  // Render loading state
  if (isLoadingSurvey) {
    return (
      <Card className="w-full max-w-3xl mx-auto p-4 bg-white border-none">
        <div className="flex justify-center items-center h-64">
          <Spinner className="text-gray-600" size="large" />
        </div>
      </Card>
    );
  }

  // Render error state with retry button

  if (hasError) {
    return <ErrorPage message={'Failed to load survey. Please try again.'} />;
  }

  return (
    <Card className="w-full max-w-3xl mx-auto p-4 bg-white border-none">
      {/* Header with back button, close button and progress bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <button className="p-2 hover:bg-gray-100 rounded-full" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <Progress value={progressValue} className="h-2" />
          <div className="text-right text-sm text-gray-500">{progressValue}%</div>
        </div>
      </div>

      {/* Question section */}
      {questions.length > 0 && questionIndex < questions.length && (
        <>
          <div className="mb-12">
            <div className="text-sm text-gray-600 mb-2">
              Question {questionIndex + 1} of {questions.length}
            </div>
            <h2 className="text-xl font-medium mb-6">{questions[questionIndex]?.titleText.replace(/<\/?[^>]+(>|$)/g, '')}</h2>
            <p className="text-gray-600">Answer the question by selecting the emoji related to your satisfaction</p>
          </div>

          {/* Emoji rating options */}
          <div className="flex justify-between px-4">
            {ratings.map((rating) => (
              <button
                key={rating.value}
                onClick={() => handleResponse(rating.value)}
                disabled={isLoadingAnswer}
                className={`flex flex-col items-center gap-2 transition-transform ${
                  selectedRating === rating.value ? 'transform scale-110' : ''
                } ${isLoadingAnswer ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
              >
                <span className="text-3xl">{rating.emoji}</span>
                <span className="text-xs text-gray-600 text-center">{rating.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </Card>
  );
};

export default EmojiSurvey;
