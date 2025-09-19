import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '/components/ui/card';
import { Button } from '/components/ui/button';
import { Input } from '/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '/components/ui/select';

interface Team {
  id: number;
  name: string;
  players: string[];
  group: 'A' | 'B';
}

interface Match {
  id: string;
  team1: Team;
  team2: Team;
  score1: number | null;
  score2: number | null;
  stage: 'group' | 'semi' | 'final';
  group?: 'A' | 'B';
}

interface GroupStanding {
  team: Team;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  pointsDiff: number;
}

const teams: Team[] = [
  { id: 1, name: 'Đội 1', players: ['Quân', 'Quỳnh'], group: 'A' },
  { id: 2, name: 'Đội 2', players: ['Thông', 'Linh'], group: 'A' },
  { id: 3, name: 'Đội 3', players: ['Thành', 'Sơn'], group: 'A' },
  { id: 4, name: 'Đội 4', players: ['Minh', 'Quang'], group: 'A' },
  { id: 5, name: 'Đội 5', players: ['Tú', 'Tiến'], group: 'B' },
  { id: 6, name: 'Đội 6', players: ['Tuấn', 'Diệp'], group: 'B' },
  { id: 7, name: 'Đội 7', players: ['Vơn', 'Ngân'], group: 'B' },
  { id: 8, name: 'Đội 8', players: ['Trung', 'Kiên'], group: 'B' },
];

const initialGroupMatches: Match[] = [
  // Bảng A
  { id: 'A1', team1: teams[0], team2: teams[1], score1: null, score2: null, stage: 'group', group: 'A' },
  { id: 'A2', team1: teams[2], team2: teams[3], score1: null, score2: null, stage: 'group', group: 'A' },
  { id: 'A3', team1: teams[0], team2: teams[2], score1: null, score2: null, stage: 'group', group: 'A' },
  { id: 'A4', team1: teams[1], team2: teams[3], score1: null, score2: null, stage: 'group', group: 'A' },
  { id: 'A5', team1: teams[1], team2: teams[2], score1: null, score2: null, stage: 'group', group: 'A' },
  { id: 'A6', team1: teams[0], team2: teams[3], score1: null, score2: null, stage: 'group', group: 'A' },
  // Bảng B
  { id: 'B1', team1: teams[5], team2: teams[7], score1: null, score2: null, stage: 'group', group: 'B' },
  { id: 'B2', team1: teams[6], team2: teams[7], score1: null, score2: null, stage: 'group', group: 'B' },
  { id: 'B3', team1: teams[4], team2: teams[6], score1: null, score2: null, stage: 'group', group: 'B' },
  { id: 'B4', team1: teams[4], team2: teams[5], score1: null, score2: null, stage: 'group', group: 'B' },
  { id: 'B5', team1: teams[5], team2: teams[6], score1: null, score2: null, stage: 'group', group: 'B' },
  { id: 'B6', team1: teams[4], team2: teams[7], score1: null, score2: null, stage: 'group', group: 'B' },
];

export default function PickleballTournament() {
  const [matches, setMatches] = useState<Match[]>(initialGroupMatches);
  const [currentStage, setCurrentStage] = useState<'group' | 'semi' | 'final'>('group');
  const [groupStandings, setGroupStandings] = useState<{ A: GroupStanding[], B: GroupStanding[] }>({ A: [], B: [] });

  const calculateGroupStandings = () => {
    const groupA = teams.filter(team => team.group === 'A');
    const groupB = teams.filter(team => team.group === 'B');
    
    const calculateStanding = (groupTeams: Team[], groupMatches: Match[]): GroupStanding[] => {
      const standings: GroupStanding[] = groupTeams.map(team => ({
        team,
        wins: 0,
        losses: 0,
        pointsFor: 0,
        pointsAgainst: 0,
        pointsDiff: 0
      }));

      groupMatches.forEach(match => {
        if (match.score1 !== null && match.score2 !== null) {
          const team1Standing = standings.find(s => s.team.id === match.team1.id)!;
          const team2Standing = standings.find(s => s.team.id === match.team2.id)!;
          
          team1Standing.pointsFor += match.score1;
          team1Standing.pointsAgainst += match.score2;
          team2Standing.pointsFor += match.score2;
          team2Standing.pointsAgainst += match.score1;
          
          if (match.score1 > match.score2) {
            team1Standing.wins++;
            team2Standing.losses++;
          } else {
            team2Standing.wins++;
            team1Standing.losses++;
          }
        }
      });

      standings.forEach(standing => {
        standing.pointsDiff = standing.pointsFor - standing.pointsAgainst;
      });

      // Sắp xếp theo thứ tự: số trận thắng, hiệu số, điểm ghi
      standings.sort((a, b) => {
        if (a.wins !== b.wins) return b.wins - a.wins;
        if (a.pointsDiff !== b.pointsDiff) return b.pointsDiff - a.pointsDiff;
        return b.pointsFor - a.pointsFor;
      });

      return standings;
    };

    const groupAMatches = matches.filter(m => m.group === 'A');
    const groupBMatches = matches.filter(m => m.group === 'B');

    setGroupStandings({
      A: calculateStanding(groupA, groupAMatches),
      B: calculateStanding(groupB, groupBMatches)
    });
  };

  const generateKnockoutMatches = () => {
    if (groupStandings.A.length === 0 || groupStandings.B.length === 0) return;

    const firstA = groupStandings.A[0]?.team;
    const secondA = groupStandings.A[1]?.team;
    const firstB = groupStandings.B[0]?.team;
    const secondB = groupStandings.B[1]?.team;

    if (!firstA || !secondA || !firstB || !secondB) return;

    const semiMatches: Match[] = [
      { id: 'SF1', team1: firstA, team2: secondB, score1: null, score2: null, stage: 'semi' },
      { id: 'SF2', team1: firstB, team2: secondA, score1: null, score2: null, stage: 'semi' }
    ];

    setMatches(prev => [...prev.filter(m => m.stage === 'group'), ...semiMatches]);
    setCurrentStage('semi');
  };

  const generateFinalMatches = () => {
    const semiMatches = matches.filter(m => m.stage === 'semi');
    const sf1 = semiMatches.find(m => m.id === 'SF1');
    const sf2 = semiMatches.find(m => m.id === 'SF2');

    if (!sf1 || !sf2 || sf1.score1 === null || sf1.score2 === null || sf2.score1 === null || sf2.score2 === null) {
      return;
    }

    const sf1Winner = sf1.score1 > sf1.score2 ? sf1.team1 : sf1.team2;
    const sf2Winner = sf2.score1 > sf2.score2 ? sf2.team1 : sf2.team2;

    const finalMatches: Match[] = [
      { id: 'FINAL', team1: sf1Winner, team2: sf2Winner, score1: null, score2: null, stage: 'final' }
    ];

    setMatches(prev => [...prev.filter(m => m.stage === 'group' || m.stage === 'semi'), ...finalMatches]);
    setCurrentStage('final');
  };

  const updateScore = (matchId: string, team: 1 | 2, score: string) => {
    setMatches(prev => prev.map(match => {
      if (match.id === matchId) {
        const newScore = score === '' ? null : parseInt(score);
        return {
          ...match,
          [team === 1 ? 'score1' : 'score2']: newScore
        };
      }
      return match;
    }));
  };

  const getRankingList = () => {
    const finalMatch = matches.find(m => m.stage === 'final');
    const semiMatches = matches.filter(m => m.stage === 'semi');
    
    const rankings = [];
    
    if (finalMatch && finalMatch.score1 !== null && finalMatch.score2 !== null) {
      const champion = finalMatch.score1 > finalMatch.score2 ? finalMatch.team1 : finalMatch.team2;
      const runnerUp = finalMatch.score1 > finalMatch.score2 ? finalMatch.team2 : finalMatch.team1;
      rankings.push({ position: 1, team: champion, title: '🏆 Vô địch' });
      rankings.push({ position: 2, team: runnerUp, title: '🥈 Á quân' });
      
      // Tìm 2 đội thua bán kết để xếp đồng giải 3
      const sf1 = semiMatches.find(m => m.id === 'SF1');
      const sf2 = semiMatches.find(m => m.id === 'SF2');
      
      if (sf1 && sf1.score1 !== null && sf1.score2 !== null && 
          sf2 && sf2.score1 !== null && sf2.score2 !== null) {
        const sf1Loser = sf1.score1 > sf1.score2 ? sf1.team2 : sf1.team1;
        const sf2Loser = sf2.score1 > sf2.score2 ? sf2.team2 : sf2.team1;
        rankings.push({ position: 3, team: sf1Loser, title: '🥉 Đồng giải 3' });
        rankings.push({ position: 3, team: sf2Loser, title: '🥉 Đồng giải 3' });
      }
    }
    
    return rankings;
  };

  useEffect(() => {
    calculateGroupStandings();
  }, [matches]);

  const getMatchTitle = (match: Match) => {
    if (match.stage === 'group') {
      return `Trận ${match.id}`;
    } else if (match.stage === 'semi') {
      return match.id === 'SF1' ? 'Bán kết 1' : 'Bán kết 2';
    } else if (match.stage === 'final') {
      return 'Chung kết';
    }
    return '';
  };

  const renderScoreInput = (match: Match, team: 1 | 2) => (
    <Input
      type="number"
      min="0"
      placeholder="0"
      value={team === 1 ? (match.score1 || '') : (match.score2 || '')}
      onChange={(e) => updateScore(match.id, team, e.target.value)}
      className="w-16 text-center text-lg font-semibold"
    />
  );

  return (
    <div className="min-h-screen bg-background p-4 max-w-md mx-auto">
      <div className="space-y-6">
        {/* Header */}
        <Card className="bg-yellow-600 text-white">
          <CardHeader className="text-center py-4">
            <CardTitle className="text-2xl font-bold">🏓 Giải Pickleball</CardTitle>
            <p className="text-white/90">Hệ thống xếp hạng tự động</p>
          </CardHeader>
        </Card>

        {/* Stage Navigation */}
        <div className="flex justify-center space-x-2">
          <Button
            variant={currentStage === 'group' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrentStage('group')}
          >
            Vòng bảng
          </Button>
          <Button
            variant={currentStage === 'semi' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrentStage('semi')}
          >
            Bán kết
          </Button>
          <Button
            variant={currentStage === 'final' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrentStage('final')}
          >
            Chung kết
          </Button>
        </div>

        {/* Group Stage */}
        {currentStage === 'group' && (
          <div className="space-y-4">
            {/* Group A Matches */}
            <Card>
              <CardHeader className="bg-blue-600 text-white">
                <CardTitle className="text-lg">Bảng A - Lịch thi đấu</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-4">
                {matches.filter(m => m.group === 'A').map(match => (
                  <div key={match.id} className="border rounded-lg p-3 bg-card">
                    <div className="text-sm font-medium text-muted-foreground mb-2">
                      {getMatchTitle(match)}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 text-sm">
                        <div className="font-medium">{match.team1.name}</div>
                        <div className="text-muted-foreground">{match.team1.players.join(' + ')}</div>
                      </div>
                      <div className="flex items-center space-x-2 mx-4">
                        {renderScoreInput(match, 1)}
                        <span className="text-muted-foreground">-</span>
                        {renderScoreInput(match, 2)}
                      </div>
                      <div className="flex-1 text-sm text-right">
                        <div className="font-medium">{match.team2.name}</div>
                        <div className="text-muted-foreground">{match.team2.players.join(' + ')}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Group B Matches */}
            <Card>
              <CardHeader className="bg-blue-600 text-white">
                <CardTitle className="text-lg">Bảng B - Lịch thi đấu</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-4">
                {matches.filter(m => m.group === 'B').map(match => (
                  <div key={match.id} className="border rounded-lg p-3 bg-card">
                    <div className="text-sm font-medium text-muted-foreground mb-2">
                      {getMatchTitle(match)}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 text-sm">
                        <div className="font-medium">{match.team1.name}</div>
                        <div className="text-muted-foreground">{match.team1.players.join(' + ')}</div>
                      </div>
                      <div className="flex items-center space-x-2 mx-4">
                        {renderScoreInput(match, 1)}
                        <span className="text-muted-foreground">-</span>
                        {renderScoreInput(match, 2)}
                      </div>
                      <div className="flex-1 text-sm text-right">
                        <div className="font-medium">{match.team2.name}</div>
                        <div className="text-muted-foreground">{match.team2.players.join(' + ')}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Group Standings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="bg-yellow-600 text-white">
                  <CardTitle className="text-lg">Bảng xếp hạng A</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    {groupStandings.A.map((standing, index) => (
                      <div key={standing.team.id} className={`flex justify-between items-center p-2 rounded ${index < 2 ? 'bg-blue-100 text-blue-900 font-semibold' : 'bg-gray-100'}`}>
                        <div>
                          <div className="font-medium">{index + 1}. {standing.team.name}</div>
                          <div className="text-xs text-muted-foreground">{standing.team.players.join(' + ')}</div>
                        </div>
                        <div className="text-right text-sm">
                          <div>{standing.wins}T - {standing.losses}B</div>
                          <div className="text-xs">HS: {standing.pointsDiff > 0 ? '+' : ''}{standing.pointsDiff}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="bg-yellow-600 text-white">
                  <CardTitle className="text-lg">Bảng xếp hạng B</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    {groupStandings.B.map((standing, index) => (
                      <div key={standing.team.id} className={`flex justify-between items-center p-2 rounded ${index < 2 ? 'bg-blue-100 text-blue-900 font-semibold' : 'bg-gray-100'}`}>
                        <div>
                          <div className="font-medium">{index + 1}. {standing.team.name}</div>
                          <div className="text-xs text-muted-foreground">{standing.team.players.join(' + ')}</div>
                        </div>
                        <div className="text-right text-sm">
                          <div>{standing.wins}T - {standing.losses}B</div>
                          <div className="text-xs">HS: {standing.pointsDiff > 0 ? '+' : ''}{standing.pointsDiff}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {groupStandings.A.length > 0 && groupStandings.B.length > 0 && (
              <Button onClick={generateKnockoutMatches} className="w-full" size="lg">
                Tạo lịch vòng loại trực tiếp
              </Button>
            )}
          </div>
        )}

        {/* Semi-finals */}
        {currentStage === 'semi' && (
          <div className="space-y-4">
            <Card>
              <CardHeader className="bg-blue-600 text-white">
                <CardTitle className="text-lg">Vòng bán kết</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-4">
                {matches.filter(m => m.stage === 'semi').map(match => (
                  <div key={match.id} className="border rounded-lg p-3 bg-card">
                    <div className="text-sm font-medium text-muted-foreground mb-2">
                      {getMatchTitle(match)}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 text-sm">
                        <div className="font-medium">{match.team1.name}</div>
                        <div className="text-muted-foreground">{match.team1.players.join(' + ')}</div>
                      </div>
                      <div className="flex items-center space-x-2 mx-4">
                        {renderScoreInput(match, 1)}
                        <span className="text-muted-foreground">-</span>
                        {renderScoreInput(match, 2)}
                      </div>
                      <div className="flex-1 text-sm text-right">
                        <div className="font-medium">{match.team2.name}</div>
                        <div className="text-muted-foreground">{match.team2.players.join(' + ')}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Button onClick={generateFinalMatches} className="w-full" size="lg">
              Tạo lịch chung kết
            </Button>
          </div>
        )}

        {/* Finals */}
        {currentStage === 'final' && (
          <div className="space-y-4">
            <Card>
              <CardHeader className="bg-yellow-600 text-white">
                <CardTitle className="text-lg">Trận chung kết</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-4">
                {matches.filter(m => m.stage === 'final').map(match => (
                  <div key={match.id} className="border rounded-lg p-3 bg-yellow-50 border-yellow-600">
                    <div className="text-sm font-medium text-muted-foreground mb-2">
                      {getMatchTitle(match)}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 text-sm">
                        <div className="font-medium">{match.team1.name}</div>
                        <div className="text-muted-foreground">{match.team1.players.join(' + ')}</div>
                      </div>
                      <div className="flex items-center space-x-2 mx-4">
                        {renderScoreInput(match, 1)}
                        <span className="text-muted-foreground">-</span>
                        {renderScoreInput(match, 2)}
                      </div>
                      <div className="flex-1 text-sm text-right">
                        <div className="font-medium">{match.team2.name}</div>
                        <div className="text-muted-foreground">{match.team2.players.join(' + ')}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Final Rankings */}
            {getRankingList().length > 0 && (
              <Card>
                <CardHeader className="bg-yellow-600 text-white">
                  <CardTitle className="text-lg">🏆 Kết quả cuối cùng</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {getRankingList().map(ranking => (
                      <div key={ranking.position} className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-yellow-100 to-blue-100">
                        <div>
                          <div className="font-bold text-lg">{ranking.title}</div>
                          <div className="font-medium">{ranking.team.name}</div>
                          <div className="text-sm text-muted-foreground">{ranking.team.players.join(' + ')}</div>
                        </div>
                        <div className="text-3xl font-bold text-blue-600">
                          #{ranking.position}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
