import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ThumbsDown, Frown, Meh, Smile, ThumbsUp } from 'lucide-react';

// Types
type TQuestion = {
  surveyQuestionId: string;
  name: string;
  answerTypeId: 638 | 640 | 641;
  possibleAnswers: TPossibleAnswers[];
};

type TPossibleAnswers = {
  surveyQuestionAnswerId: string;
  surveyQuestionId: string;
  name: string;
};

type TSurveyResponseBody = {
  Response: {
    surveyResponseId: string;
    survey: {
      surveyId: string;
      name: string;
      topics: {
        surveyTopicId: string;
        name: string;
        questions: TQuestion[];
      }[];
    };
  };
};

type TStep = {
  titleText: string;
  description?: string;
  answerTypeId: TQuestion['answerTypeId'];
  possibleAnswers: TPossibleAnswers[];
};

type TSteps = TStep[];

// Emotion icons mapping
const iconsMap: Record<string, React.ReactNode> = {
  '1': <ThumbsDown className="h-6 w-6" />,
  '2': <Frown className="h-6 w-6" />,
  '3': <Meh className="h-6 w-6" />,
  '4': <Smile className="h-6 w-6" />,
  '5': <ThumbsUp className="h-6 w-6" />,
};

// Loading spinner component
const LoadingSpinner = ({ isLoading }: { isLoading: boolean }) => {
  if (!isLoading) return null;

  return (
    <div className="flex justify-center my-4">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
    </div>
  );
};

// Wizard component
const Wizard = ({
  steps,
  surveyResponseId,
  checkInId,
  onClose,
  onCompleted,
}: {
  steps: TSteps;
  surveyResponseId: string;
  checkInId: string;
  onClose: () => void;
  onCompleted: () => void;
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [isPosting, setIsPosting] = useState(false);

  const calcProgress = () => ((activeStep + 1) / steps.length) * 100;

  const getNext = (answerId: string, questionId: string) => async () => {
    try {
      setIsPosting(true);
      const surveyAnswerPostResponse = await API.post(EXECUTE_REQUEST_PATH, {
        entityName: 'SurveyResponseAnswer',
        requestName: 'UpsertRecordReq',
        inputParamters: {
          Entity: {
            SurveyQuestionId: questionId,
            SurveyQuestionAnswerId: answerId,
            AnswerSingleLine: '',
            AnswerMultiLine: '',
            Score: '-100',
            RegardingId: checkInId,
            RegardingIdObjectTypeCode: 'CheckIn',
            SurveyResponseId: surveyResponseId,
          },
        },
      });

      if (!surveyAnswerPostResponse.isSuccess) {
        // Implement your error handling here
        return;
      }

      if (activeStep + 1 === steps.length) {
        onCompleted();
        return;
      }
      setActiveStep(activeStep + 1);
    } catch (e) {
      console.error(e);
      // Implement your error handling here
    } finally {
      setIsPosting(false);
    }
  };

  const getUserInputComponent = () => {
    const _activeStep = steps[activeStep];

    switch (_activeStep.answerTypeId) {
      case 638:
        return (
          <div className="flex flex-wrap gap-2">
            {_activeStep.possibleAnswers.map((el) => (
              <Button
                key={el.surveyQuestionAnswerId}
                variant="outline"
                disabled={isPosting}
                onClick={getNext(el.surveyQuestionAnswerId, el.surveyQuestionId)}
              >
                {el.name}
              </Button>
            ))}
            <LoadingSpinner isLoading={isPosting} />
          </div>
        );
      case 640:
        return (
          <div className="flex flex-col items-center w-full">
            <div className="flex justify-evenly gap-4">
              {_activeStep.possibleAnswers.map((el) => (
                <button
                  key={el.surveyQuestionAnswerId}
                  disabled={isPosting}
                  onClick={getNext(el.surveyQuestionAnswerId, el.surveyQuestionId)}
                  className="p-2 rounded-full hover:bg-secondary disabled:opacity-50 transition-colors"
                >
                  {iconsMap[el.name] || <span>&nbsp;</span>}
                </button>
              ))}
            </div>
            <LoadingSpinner isLoading={isPosting} />
          </div>
        );
      default:
        return <span>&nbsp;</span>;
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <Progress value={calcProgress()} className="w-full" />
      <div className="text-right text-sm">{Math.floor(calcProgress())}%</div>

      <div className="text-sm font-inter">
        Question {activeStep + 1} of {steps.length}
      </div>

      <h2 className="text-2xl font-semibold font-inter pt-2 pb-3">{steps[activeStep].titleText}</h2>

      {steps[activeStep].description && <p className="pb-8">{steps[activeStep].description}</p>}

      <div
        className={`flex flex-col justify-end pb-4 min-w-0 md:min-w-[520px] 
        ${steps[activeStep].answerTypeId === 640 ? '' : 'flex-1'}`}
      >
        {getUserInputComponent()}
      </div>
    </div>
  );
};

// Main hook component
const useRoomInspectionWizardDialog = ({
  onClose,
  fullScreen: _fullScreen,
  checkInId,
  onCompleted,
}: {
  onClose?: () => void;
  onCompleted: () => void;
  fullScreen?: boolean;
  subtitle?: string;
  checkInId?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [survey, setSurvey] = useState<TSurveyResponseBody['Response']>();

  useEffect(() => {
    if (!checkInId) {
      console.debug('No checkInId provided');
      return;
    }

    const getSteps = async () => {
      try {
        const recordIdResponse = await API.get(`${GET_SURVEY_RESPONSE_PATH} '${checkInId}'`);
        const recordId = recordIdResponse[1].recordId;

        const surveyResponse = await API.post(EXECUTE_REQUEST_PATH, {
          entityName: 'SurveyResponse',
          recordId: recordId,
          requestName: 'GetSurveyExecuteRequest',
        });

        if (!surveyResponse.isSuccess) {
          // Implement your error handling here
          return;
        }

        setSurvey(surveyResponse.Response);
      } catch (error) {
        console.error(error);
        // Implement your error handling here
      } finally {
        setIsLoading(false);
      }
    };

    getSteps();
  }, [checkInId]);

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  const handleCompleted = () => {
    onCompleted();
    handleClose();
  };

  const component = !checkInId ? null : (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md md:max-w-lg">
        <DialogHeader>
          <div className="flex items-center">
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 disabled:pointer-events-none"
              disabled={isLoading}
            >
              <X className="h-4 w-4" />
            </button>
            <DialogTitle>{survey?.survey.name || 'Survey'}</DialogTitle>
          </div>
        </DialogHeader>

        {!survey ? (
          isLoading && (
            <div className="p-4 flex justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          )
        ) : (
          <Wizard
            steps={survey.survey.topics[0].questions.map((q) => ({
              titleText: q.name,
              answerTypeId: q.answerTypeId,
              possibleAnswers: q.possibleAnswers,
            }))}
            checkInId={checkInId}
            surveyResponseId={survey.surveyResponseId}
            onClose={handleClose}
            onCompleted={handleCompleted}
          />
        )}
      </DialogContent>
    </Dialog>
  );

  const open = () => setIsOpen(true);

  return { open, component };
};

export default useRoomInspectionWizardDialog;
