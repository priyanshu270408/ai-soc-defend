import { useState } from "react";
import { SOCLayout } from "@/components/SOCLayout";
import { RoleGuard } from "@/components/RoleGuard";
import { SeverityBadge, StatusBadge } from "@/components/SeverityBadge";
import { RiskGauge } from "@/components/RiskGauge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { getSOCData, type Incident, type AlertStatus } from "@/lib/soc-data";
import {
  FileWarning,
  Clock,
  Users,
  Server,
  Bot,
  MessageSquare,
  Send,
  CheckCircle,
  Shield,
  AlertTriangle,
  Calendar,
} from "lucide-react";

function IncidentDetail({ incident }: { incident: Incident }) {
  const [status, setStatus] = useState<AlertStatus>(incident.status);
  const [notes, setNotes] = useState(incident.notes);
  const [newNote, setNewNote] = useState("");

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const note = {
      id: `note_${Date.now()}`,
      author: "SOC Analyst",
      content: newNote.trim(),
      timestamp: new Date().toISOString(),
    };
    setNotes([...notes, note]);
    setNewNote("");
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <SeverityBadge severity={incident.severity} />
            <StatusBadge status={status} />
          </div>
          <h2 className="text-xl font-bold text-foreground">{incident.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{incident.description}</p>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Clock className="size-3" /> {new Date(incident.createdAt).toLocaleString()}</span>
            <span className="flex items-center gap-1"><Users className="size-3" /> {incident.userName}</span>
            <span className="flex items-center gap-1"><Server className="size-3" /> {incident.assetNames.join(", ")}</span>
          </div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <RiskGauge score={incident.riskScore} label="Incident Risk" size="sm" />
        </div>
      </div>

      {/* AI Analysis */}
      <Card className="border-primary/20 bg-primary/5 py-3">
        <CardContent className="px-4">
          <div className="flex items-center gap-2 mb-2">
            <Bot className="size-4 text-primary" />
            <span className="text-xs font-semibold text-primary">AI Analysis</span>
            <span className="text-[10px] text-muted-foreground ml-auto">
              {/* VERIFY IN CURRENT PLATFORM */} Grok API via Edge Function
            </span>
          </div>
          <p className="text-sm leading-relaxed text-foreground/80">{incident.aiExplanation}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Timeline */}
        <Card className="border-border/50 bg-card/60 py-3">
          <CardHeader className="px-4 pb-0">
            <CardTitle className="text-xs font-semibold flex items-center gap-2">
              <Calendar className="size-3.5 text-muted-foreground" />
              Event Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pt-3">
            <div className="relative space-y-3">
              <div className="absolute left-[11px] top-2 bottom-2 w-px bg-border/60" />
              {incident.events
                .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                .map((event, i) => (
                  <div key={event.id} className="flex items-start gap-3 relative">
                    <div className="relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full border border-border/60 bg-card text-[10px] font-bold text-muted-foreground">
                      {i + 1}
                    </div>
                    <div className="flex-1 rounded-md border border-border/40 bg-card/40 px-3 py-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-medium text-foreground">
                          {event.type.replace(/_/g, " ")}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          +{event.riskContribution}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {event.source} · {new Date(event.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Recommended Actions */}
        <Card className="border-border/50 bg-card/60 py-3">
          <CardHeader className="px-4 pb-0">
            <CardTitle className="text-xs font-semibold flex items-center gap-2">
              <Shield className="size-3.5 text-muted-foreground" />
              Recommended Defensive Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pt-3">
            <div className="space-y-2">
              {incident.recommendedActions.map((action, i) => (
                <div key={i} className="flex items-start gap-2.5 rounded-md border border-border/40 bg-card/30 px-3 py-2">
                  <CheckCircle className="size-3.5 mt-0.5 shrink-0 text-primary/60" />
                  <span className="text-xs text-foreground/80">{action}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status + Notes */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Status editor */}
        <Card className="border-border/50 bg-card/60 py-3">
          <CardHeader className="px-4 pb-0">
            <CardTitle className="text-xs font-semibold">Incident Status</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pt-3">
            <Select value={status} onValueChange={(v) => setStatus(v as AlertStatus)}>
              <SelectTrigger className="w-full bg-background/50 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="false_positive">False Positive</SelectItem>
              </SelectContent>
            </Select>
            <p className="mt-2 text-[10px] text-muted-foreground">
              Last updated: {new Date(incident.updatedAt).toLocaleString()}
            </p>
          </CardContent>
        </Card>

        {/* Analyst notes thread */}
        <Card className="border-border/50 bg-card/60 py-3">
          <CardHeader className="px-4 pb-0">
            <CardTitle className="text-xs font-semibold flex items-center gap-2">
              <MessageSquare className="size-3.5 text-muted-foreground" />
              Analyst Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pt-3">
            <ScrollArea className="max-h-[200px] mb-3">
              <div className="space-y-2">
                {notes.map((note) => (
                  <div key={note.id} className="rounded-md border border-border/40 bg-card/30 px-3 py-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-medium text-foreground">{note.author}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(note.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-foreground/80 mt-1">{note.content}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="flex gap-2">
              <Textarea
                placeholder="Add a note..."
                className="min-h-[60px] text-xs bg-background/50 resize-none"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
              />
              <Button
                size="sm"
                className="self-end shrink-0"
                onClick={handleAddNote}
                disabled={!newNote.trim()}
              >
                <Send className="size-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function IncidentsPage() {
  const data = getSOCData();
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  return (
    <SOCLayout>
      <RoleGuard allowedRoles={["analyst", "officer"]}>
        <div className="space-y-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Incident Investigation</h1>
            <p className="text-sm text-muted-foreground">
              Correlated incident timelines, AI analysis, and case management
            </p>
          </div>

          {!selectedIncident ? (
            /* Incidents list */
            <div className="grid grid-cols-1 gap-3">
              {data.incidents.map((incident) => (
                <button
                  key={incident.id}
                  onClick={() => setSelectedIncident(incident)}
                  className="w-full text-left rounded-xl border border-border/50 bg-card/60 p-4 hover:bg-accent/30 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-0.5">
                      <SeverityBadge severity={incident.severity} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{incident.title}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{incident.description}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1"><Users className="size-3" /> {incident.userName}</span>
                        <span className="flex items-center gap-1"><Server className="size-3" /> {incident.assetNames.join(", ")}</span>
                        <span className="flex items-center gap-1"><Clock className="size-3" /> {new Date(incident.createdAt).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1"><AlertTriangle className="size-3" /> {incident.events.length} events</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <StatusBadge status={incident.status} />
                      <span className="text-xl font-bold tabular-nums" style={{
                        color: incident.riskScore >= 80 ? "var(--color-severity-critical)" :
                               incident.riskScore >= 60 ? "var(--color-severity-high)" :
                               incident.riskScore >= 35 ? "var(--color-severity-medium)" :
                               "var(--color-severity-low)"
                      }}>
                        {incident.riskScore}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            /* Incident detail */
            <div>
              <Button
                variant="ghost"
                size="sm"
                className="mb-4 text-xs"
                onClick={() => setSelectedIncident(null)}
              >
                ← Back to Incidents
              </Button>
              <IncidentDetail incident={selectedIncident} />
            </div>
          )}
        </div>
      </RoleGuard>
    </SOCLayout>
  );
}
