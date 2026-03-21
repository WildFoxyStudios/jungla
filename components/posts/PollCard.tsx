'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PollWithOptions, pollsApi } from '@/lib/api-polls';
import { CheckCircle, Circle, Clock, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface PollCardProps {
  poll: PollWithOptions;
  onVote?: () => void;
}

export default function PollCard({ poll, onVote }: PollCardProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>(poll.user_votes || []);
  const [isVoting, setIsVoting] = useState(false);
  const [showResults, setShowResults] = useState(poll.user_votes.length > 0);
  const [currentPoll, setCurrentPoll] = useState(poll);

  const hasVoted = currentPoll.user_votes.length > 0;
  const isClosed = currentPoll.closes_at && new Date(currentPoll.closes_at) < new Date();
  const canVote = !hasVoted && !isClosed;

  const handleOptionToggle = (optionId: string) => {
    if (!canVote) return;

    if (currentPoll.allows_multiple_answers) {
      setSelectedOptions(prev =>
        prev.includes(optionId)
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      );
    } else {
      setSelectedOptions([optionId]);
    }
  };

  const handleVote = async () => {
    if (selectedOptions.length === 0 || isVoting) return;

    setIsVoting(true);
    try {
      const updatedPoll = await pollsApi.votePoll(currentPoll.id, selectedOptions);
      setCurrentPoll(updatedPoll);
      setShowResults(true);
      onVote?.();
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setIsVoting(false);
    }
  };

  const handleRemoveVote = async () => {
    setIsVoting(true);
    try {
      await pollsApi.removeVote(currentPoll.id);
      const updatedPoll = await pollsApi.getPollResults(currentPoll.id);
      setCurrentPoll(updatedPoll);
      setSelectedOptions([]);
      setShowResults(false);
    } catch (error) {
      console.error('Error removing vote:', error);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <Card className="p-4 mb-4">
      {/* Poll Question */}
      <div className="mb-4">
        <h3 className="font-semibold text-lg mb-2">{currentPoll.question}</h3>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{currentPoll.total_votes} votos</span>
          </div>
          {currentPoll.closes_at && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>
                {isClosed
                  ? 'Cerrada'
                  : `Cierra ${formatDistanceToNow(new Date(currentPoll.closes_at), {
                      addSuffix: true,
                      locale: es,
                    })}`}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Options */}
      <div className="space-y-2">
        {currentPoll.options.map((option) => {
          const isSelected = selectedOptions.includes(option.id);
          const hasUserVoted = currentPoll.user_votes.includes(option.id);

          return (
            <div
              key={option.id}
              onClick={() => !showResults && handleOptionToggle(option.id)}
              className={`
                relative rounded-lg border p-3 transition-all cursor-pointer
                ${showResults ? 'cursor-default' : 'hover:border-blue-500'}
                ${isSelected && !showResults ? 'border-blue-500 bg-blue-50' : ''}
                ${hasUserVoted ? 'border-blue-600' : ''}
              `}
            >
              {/* Background bar for results */}
              {showResults && (
                <div
                  className="absolute inset-0 bg-blue-100 rounded-lg transition-all"
                  style={{ width: `${option.percentage}%` }}
                />
              )}

              {/* Content */}
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  {!showResults && (
                    <>
                      {currentPoll.allows_multiple_answers ? (
                        <div
                          className={`w-5 h-5 border-2 rounded flex items-center justify-center ${
                            isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-400'
                          }`}
                        >
                          {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                        </div>
                      ) : (
                        <div
                          className={`w-5 h-5 border-2 rounded-full flex items-center justify-center ${
                            isSelected ? 'border-blue-600' : 'border-gray-400'
                          }`}
                        >
                          {isSelected && (
                            <div className="w-3 h-3 bg-blue-600 rounded-full" />
                          )}
                        </div>
                      )}
                    </>
                  )}
                  {showResults && hasUserVoted && (
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                  )}
                  <span className={`${hasUserVoted ? 'font-semibold' : ''}`}>
                    {option.option_text}
                  </span>
                </div>

                {showResults && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{option.percentage.toFixed(1)}%</span>
                    <span className="text-sm text-gray-600">
                      ({option.votes_count})
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="mt-4 flex gap-2">
        {canVote && (
          <Button
            onClick={handleVote}
            disabled={selectedOptions.length === 0 || isVoting}
            className="flex-1"
          >
            {isVoting ? 'Votando...' : 'Votar'}
          </Button>
        )}
        {hasVoted && !isClosed && (
          <Button
            onClick={handleRemoveVote}
            disabled={isVoting}
            variant="outline"
            className="flex-1"
          >
            {isVoting ? 'Eliminando...' : 'Eliminar voto'}
          </Button>
        )}
        {!hasVoted && !isClosed && (
          <Button
            onClick={() => setShowResults(!showResults)}
            variant="ghost"
          >
            {showResults ? 'Ver opciones' : 'Ver resultados'}
          </Button>
        )}
      </div>

      {/* Helper text */}
      {canVote && currentPoll.allows_multiple_answers && (
        <p className="mt-2 text-xs text-gray-500">
          Puedes seleccionar múltiples opciones
        </p>
      )}
    </Card>
  );
}
