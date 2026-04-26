"use client";

import {
  BadgeCheck,
  Bot,
  Clock3,
  RotateCcw,
  Shield,
  Sparkles,
  Target,
  Trophy,
  UserRound,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { prospects as initialProspects } from "@/data/prospects";
import { teams } from "@/data/teams";
import { getRoundAndPick, positionFitsNeed, TOTAL_ROUNDS } from "@/lib/draft";
import type { AiPickResponse, DraftPick, Prospect, Team } from "@/types/draft";

const totalPicks = teams.length * TOTAL_ROUNDS;

function classNames(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function TeamNeeds({ team, compact = false }: { team: Team; compact?: boolean }) {
  return (
    <div className="flex flex-wrap gap-2">
      {team.needs.map((need) => (
        <span
          key={need}
          className={classNames(
            "rounded-full border border-slate-200 bg-white px-2.5 py-1 font-semibold text-slate-700",
            compact ? "text-[11px]" : "text-xs",
          )}
        >
          {need}
        </span>
      ))}
    </div>
  );
}

export default function Home() {
  const [selectedTeamId, setSelectedTeamId] = useState(teams[0].id);
  const [started, setStarted] = useState(false);
  const [availableProspects, setAvailableProspects] =
    useState<Prospect[]>(initialProspects);
  const [picks, setPicks] = useState<DraftPick[]>([]);
  const [pickIndex, setPickIndex] = useState(0);
  const [lastMessage, setLastMessage] = useState(
    "Choose your franchise and start the draft.",
  );

  const selectedTeam = teams.find((team) => team.id === selectedTeamId) ?? teams[0];
  const currentTeam = teams[pickIndex % teams.length];
  const currentSlot = getRoundAndPick(pickIndex, teams.length);
  const isComplete = picks.length >= totalPicks;
  const isUserTurn = started && !isComplete && currentTeam.id === selectedTeamId;
  const aiThinking = started && !isComplete && !isUserTurn;
  const progressPercent = Math.round((picks.length / totalPicks) * 100);

  const selectedTeamPicks = picks.filter((pick) => pick.teamId === selectedTeamId);

  const draftByTeam = useMemo(
    () =>
      teams.map((team) => ({
        team,
        picks: picks.filter((pick) => pick.teamId === team.id),
      })),
    [picks],
  );

  const resetDraft = useCallback(() => {
    setStarted(false);
    setAvailableProspects(initialProspects);
    setPicks([]);
    setPickIndex(0);
    setLastMessage("Choose your franchise and start the draft.");
  }, []);

  const makePick = useCallback(
    (prospect: Prospect, reason: string, controlledByUser: boolean) => {
      const slot = getRoundAndPick(pickIndex, teams.length);

      setPicks((existing) => [
        ...existing,
        {
          ...slot,
          teamId: currentTeam.id,
          teamName: currentTeam.name,
          prospect,
          reason,
          controlledByUser,
        },
      ]);
      setAvailableProspects((existing) =>
        existing.filter((player) => player.name !== prospect.name),
      );
      setPickIndex((existing) => existing + 1);
      setLastMessage(
        `${currentTeam.shortName} selected ${prospect.name}, ${prospect.position} from ${prospect.school}.`,
      );
    },
    [currentTeam, pickIndex],
  );

  useEffect(() => {
    if (!aiThinking) return;

    let cancelled = false;

    const timer = window.setTimeout(async () => {
      try {
        setLastMessage(
          `${currentTeam.name} are on the clock. AI is evaluating fit.`,
        );
        const response = await fetch("/api/ai-pick", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            team: currentTeam,
            availableProspects,
            previousPicks: picks.map(
              (pick) =>
                `${pick.overall}. ${pick.teamName}: ${pick.prospect.name} (${pick.prospect.position})`,
            ),
          }),
        });
        const data = (await response.json()) as AiPickResponse;
        if (!cancelled) {
          makePick(data.prospect, data.reason, false);
        }
      } catch {
        const fallback = availableProspects[0];
        if (!cancelled && fallback) {
          makePick(
            fallback,
            `${currentTeam.shortName} stayed with the highest available player after a request error.`,
            false,
          );
        }
      }
    }, 1400);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [
    aiThinking,
    availableProspects,
    currentTeam,
    makePick,
    picks,
  ]);

  return (
    <main className="min-h-screen pb-8">
      <section className="field-stripes text-white">
        <div className="mx-auto max-w-7xl px-5 py-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-black uppercase text-emerald-50">
                <Shield size={16} />
                Full Stack AI Engineer Assignment
              </div>
              <h1 className="text-4xl font-black sm:text-5xl">
                NFL Mock Draft Simulator
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-50">
                A live four-round war room where you control one franchise and
                server-side AI runs the rest of the board.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={resetDraft}
              className="inline-flex items-center gap-2 rounded-md border border-white/25 bg-white/10 px-4 py-2 text-sm font-bold text-white hover:bg-white/20"
            >
              <RotateCcw size={16} />
              Reset
            </button>
            {!started && (
              <button
                type="button"
                onClick={() => {
                  setStarted(true);
                  setLastMessage(`${teams[0].name} are on the clock.`);
                }}
                className="inline-flex items-center gap-2 rounded-md bg-gold px-4 py-2 text-sm font-black text-slate-950 shadow-lg hover:bg-yellow-400"
              >
                <Sparkles size={16} />
                Start Draft
              </button>
            )}
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-4">
            <div className="rounded-lg border border-white/15 bg-white/10 p-4">
              <p className="text-xs font-black uppercase text-emerald-100">
                On The Clock
              </p>
              <p className="mt-1 text-xl font-black">
                {isComplete ? "Complete" : currentTeam.shortName}
              </p>
            </div>
            <div className="rounded-lg border border-white/15 bg-white/10 p-4">
              <p className="text-xs font-black uppercase text-emerald-100">
                Round
              </p>
              <p className="mt-1 text-xl font-black">
                {isComplete ? TOTAL_ROUNDS : currentSlot.round} / {TOTAL_ROUNDS}
              </p>
            </div>
            <div className="rounded-lg border border-white/15 bg-white/10 p-4">
              <p className="text-xs font-black uppercase text-emerald-100">
                Picks Made
              </p>
              <p className="mt-1 text-xl font-black">
                {picks.length} / {totalPicks}
              </p>
            </div>
            <div className="rounded-lg border border-white/15 bg-white/10 p-4">
              <p className="text-xs font-black uppercase text-emerald-100">
                Your Team
              </p>
              <p className="mt-1 text-xl font-black">{selectedTeam.shortName}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto -mt-4 grid max-w-7xl gap-4 px-5 lg:grid-cols-[300px_minmax(0,1fr)_360px]">
        <aside className="space-y-4">
          <div className="glass-panel rounded-lg border border-white p-4 shadow-panel">
            <label className="text-xs font-black uppercase text-field">
              Your Team
            </label>
            <select
              value={selectedTeamId}
              disabled={started}
              onChange={(event) => setSelectedTeamId(event.target.value)}
              className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-ink shadow-sm"
            >
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.pick}. {team.name}
                </option>
              ))}
            </select>
            <p className="mt-3 text-sm leading-5 text-slate-600">
              {selectedTeam.context}
            </p>
            <div className="mt-4">
              <TeamNeeds team={selectedTeam} />
            </div>
          </div>

          <div className="glass-panel rounded-lg border border-white p-4 shadow-panel">
            <div className="flex items-center justify-between">
              <h2 className="font-black text-ink">Your Class</h2>
              <Trophy size={18} className="text-gold" />
            </div>
            <div className="mt-3 space-y-2">
              {selectedTeamPicks.length === 0 ? (
                <p className="text-sm text-slate-500">No picks yet.</p>
              ) : (
                selectedTeamPicks.map((pick) => (
                  <div
                    key={pick.overall}
                    className="rounded-md border border-emerald-100 bg-emerald-50 p-3"
                  >
                    <p className="text-xs font-bold text-slate-500">
                      Round {pick.round}, Pick {pick.pickInRound}
                    </p>
                    <p className="font-black text-ink">{pick.prospect.name}</p>
                    <p className="text-sm text-slate-600">
                      {pick.prospect.position} - {pick.prospect.school}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>

        <section className="space-y-4">
          <div className="glass-panel rounded-lg border border-white p-4 shadow-panel">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase text-field">
                  Current Pick
                </p>
                <h2 className="mt-1 text-2xl font-black text-ink">
                  {isComplete
                    ? "Draft Complete"
                    : `Round ${currentSlot.round}, Pick ${currentSlot.pickInRound}`}
                </h2>
                <p className="text-sm text-slate-600">
                  {isComplete
                    ? "All 28 picks are complete."
                    : `${currentTeam.name} are on the clock.`}
                </p>
              </div>
              <div className="flex items-center gap-3 rounded-md border border-slate-200 bg-white px-4 py-3 shadow-sm">
                {isUserTurn ? (
                  <UserRound className="text-field" size={22} />
                ) : (
                  <Bot className="text-navy" size={22} />
                )}
                <div>
                  <p className="text-xs font-black uppercase text-slate-500">
                    Status
                  </p>
                  <p className="text-sm font-black text-ink">
                    {isComplete
                      ? "Recap ready"
                      : isUserTurn
                        ? "Your turn"
                        : aiThinking
                          ? "AI thinking"
                          : started
                            ? "AI turn"
                            : "Not started"}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              {lastMessage}
            </div>
            <div className="mt-4">
              <div className="mb-2 flex justify-between text-xs font-black uppercase text-slate-500">
                <span>Draft Progress</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-field transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-lg border border-white shadow-panel">
            <div className="flex items-center justify-between border-b border-slate-200 p-4">
              <div>
                <h2 className="font-black text-ink">Available Big Board</h2>
                <p className="text-sm text-slate-500">
                  {availableProspects.length} prospects remaining
                </p>
              </div>
              {aiThinking && (
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-800">
                  <Clock3 size={14} />
                  Draft room active
                </div>
              )}
            </div>
            <div className="draft-scroll max-h-[620px] overflow-auto">
              {availableProspects.map((player) => {
                const fit = positionFitsNeed(player.position, selectedTeam.needs);
                return (
                  <div
                    key={player.name}
                    className="grid gap-3 border-b border-slate-100 p-4 transition-colors last:border-b-0 hover:bg-slate-50 sm:grid-cols-[58px_1fr_120px]"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-md bg-navy text-sm font-black text-white">
                      {player.rank}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-black text-ink">{player.name}</h3>
                        <span
                          className={classNames(
                            "rounded-full px-2 py-0.5 text-xs font-black",
                            fit
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-100 text-slate-700",
                          )}
                        >
                          {player.position}
                        </span>
                        {fit && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-gold/20 px-2 py-0.5 text-xs font-black text-amber-800">
                            <BadgeCheck size={12} />
                            Need fit
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm font-semibold text-slate-500">
                        {player.school}
                      </p>
                      <p className="mt-1 text-sm leading-5 text-slate-600">
                        {player.summary}
                      </p>
                    </div>
                    <div className="flex items-center sm:justify-end">
                      <button
                        type="button"
                        disabled={!isUserTurn}
                        onClick={() =>
                          makePick(
                            player,
                            `User selected ${player.name} to address ${player.position} value and team-building strategy.`,
                            true,
                          )
                        }
                        className={classNames(
                          "w-full rounded-md px-3 py-2 text-sm font-black sm:w-auto",
                          isUserTurn
                            ? "bg-field text-white shadow-sm hover:bg-emerald-950"
                            : "cursor-not-allowed bg-slate-100 text-slate-400",
                        )}
                      >
                        Draft
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="glass-panel rounded-lg border border-white p-4 shadow-panel">
            <div className="flex items-center justify-between">
              <h2 className="font-black text-ink">Draft Order</h2>
              <Target size={18} className="text-field" />
            </div>
            <div className="mt-3 space-y-2">
              {teams.map((team) => (
                <div
                  key={team.id}
                  className={classNames(
                    "rounded-md border p-3",
                    currentTeam.id === team.id && started && !isComplete
                      ? "border-field bg-emerald-50 shadow-sm"
                      : team.id === selectedTeamId
                        ? "border-gold bg-amber-50"
                        : "border-slate-200 bg-white",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-black text-ink">
                      {team.pick}. {team.shortName}
                    </p>
                    {team.id === selectedTeamId && (
                      <span className="rounded-full bg-field px-2 py-0.5 text-[11px] font-black text-white">
                        You
                      </span>
                    )}
                  </div>
                  <div className="mt-2">
                    <TeamNeeds team={team} compact />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-lg border border-white shadow-panel">
            <div className="border-b border-slate-200 p-4">
              <h2 className="font-black text-ink">Pick History</h2>
              <p className="text-sm text-slate-500">
                {picks.length}/{totalPicks} picks made
              </p>
            </div>
            <div className="draft-scroll max-h-[420px] overflow-auto">
              {picks.length === 0 ? (
                <p className="p-4 text-sm text-slate-500">
                  Start the draft to see picks here.
                </p>
              ) : (
                picks
                  .slice()
                  .reverse()
                  .map((pick) => (
                    <div
                      key={pick.overall}
                      className="border-b border-slate-100 p-4 last:border-b-0"
                    >
                      <p className="text-xs font-black text-slate-500">
                        #{pick.overall} - Round {pick.round}
                      </p>
                      <p className="mt-1 font-black text-ink">
                        {pick.teamName}: {pick.prospect.name}
                      </p>
                      <p className="text-sm text-slate-600">
                        {pick.prospect.position} - {pick.prospect.school}
                      </p>
                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        {pick.reason}
                      </p>
                    </div>
                  ))
              )}
            </div>
          </div>
        </aside>
      </section>

      {isComplete && (
        <section className="mx-auto max-w-7xl px-5 pb-8">
          <div className="glass-panel rounded-lg border border-white p-5 shadow-panel">
            <h2 className="text-xl font-black text-ink">Final Draft Recap</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {draftByTeam.map(({ team, picks: teamPicks }) => (
                <div
                  key={team.id}
                  className="rounded-md border border-slate-200 bg-slate-50 p-4"
                >
                  <h3 className="font-black text-ink">{team.name}</h3>
                  <div className="mt-3 space-y-2">
                    {teamPicks.map((pick) => (
                      <p key={pick.overall} className="text-sm text-slate-700">
                        <span className="font-black">R{pick.round}:</span>{" "}
                        {pick.prospect.name} ({pick.prospect.position})
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
