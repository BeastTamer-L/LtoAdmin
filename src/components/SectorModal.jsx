import { useEffect, useState } from "react";
import { Check, Search, MapPin } from "lucide-react";
import { supabase } from "../supabaseClient";
import { toast } from "sonner";
import { Button } from "./ui/button";
import * as Popover from "@radix-ui/react-popover";
import { Command } from "cmdk";
import { Select, SelectTrigger, SelectContent, SelectValue, SelectItem } from "./ui/select";

export default function SectorModal({ isOpen, onClose, handleSubmit }) {
  const [commanders, setCommanders] = useState([]);
  const [enforcers, setEnforcers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    sectorName: "",
    location: "",
    sectorCommander: "",
    assignedEnforcers: [], // array of ids
  });
  const [saving, setSaving] = useState(false);
  const [enforcerSearch, setEnforcerSearch] = useState("");
  const [isEnforcerPickerOpen, setIsEnforcerPickerOpen] = useState(false);

  const loadData = async () => {
    try {
      // Fetch sector commanders (position = 'sector commander')
      const { data: commandersData, error: commandersError } = await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .eq("position", "sector commander");

      if (commandersError) throw commandersError;

      // Fetch enforcers that can be assigned (roles: non-deputized, deputized, volunteer)
      const { data: enforcersData, error: enforcersError } = await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .in("position", ["Non-Deputized", "Deputized", "volunteer"]);

      if (enforcersError) throw enforcersError;

      setCommanders(commandersData || []);
      setEnforcers(enforcersData || []);
    } catch (error) {
      toast.error(`Failed to load data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const load = async () => {
      await loadData();
    };
    load();
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleEnforcer = (id) => {
    setFormData((prev) => {
      const current = prev.assignedEnforcers || [];
      const next = current.includes(id)
        ? current.filter((x) => x !== id)
        : [...current, id];
      return { ...prev, assignedEnforcers: next };
    });
  };

  const clearEnforcers = () => {
    setFormData((prev) => ({ ...prev, assignedEnforcers: [] }));
    setIsEnforcerPickerOpen(false);
  };

  const selectedEnforcers = enforcers.filter((e) =>
    formData.assignedEnforcers.includes(e.id)
  );
  const selectedLabel =
    selectedEnforcers.length === 0
      ? ""
      : selectedEnforcers.length === 1
        ? `${selectedEnforcers[0].first_name} ${selectedEnforcers[0].last_name}`
        : `${selectedEnforcers.length} enforcers selected`;

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { sectorName, location, sectorCommander, assignedEnforcers } = formData;

      // 1. Upsert sector (do nothing if exists, like original ON CONFLICT DO NOTHING)
      const { data: existingSector, error: selectError } = await supabase
        .from("sectors")
        .select("id")
        .eq("name", sectorName)
        .maybeSingle();

      if (selectError) throw selectError;

      if (!existingSector) {
        const { error: insertError } = await supabase
          .from("sectors")
          .insert({ name: sectorName, location: location });

        if (insertError) throw insertError;
      }

      // 2. Update sector commander (if selected)
      if (sectorCommander) {
        const { error: commanderError } = await supabase
          .from("profiles")
          .update({ position: "sector commander", area_of_assignment: sectorName })
          .eq("id", sectorCommander);
        if (commanderError) throw commanderError;
      }

      // 3. Update assigned enforcers
      if (assignedEnforcers.length > 0) {
        const { error: enforcersError } = await supabase
          .from("profiles")
          .update({ area_of_assignment: sectorName })
          .in("id", assignedEnforcers);
        if (enforcersError) throw enforcersError;
      }

      // Success
      const summary = `Sector "${sectorName}" saved.${sectorCommander ? " Commander assigned." : ""}${assignedEnforcers.length > 0 ? ` ${assignedEnforcers.length} enforcer(s) assigned.` : ""}`;
      toast.success(summary);

      if (handleSubmit) {
        handleSubmit({ action: "add_sector", sectorName, summary });
      }
    } catch (error) {
      console.error("Error saving sector:", error);
      toast.error(`Failed to save sector: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
      <div className="relative w-full sm:max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-white rounded-lg border border-slate-100 shadow-2xl">
        {/* Header */}
        <div className="px-6 pt-6 pb-2 shrink-0">
          <h2 className="text-xl font-semibold text-slate-900">Add Sector</h2>
          <p className="text-sm text-slate-500 mt-1">
            Create a new sector with location, commander, and assigned enforcers.
          </p>
        </div>

        <form onSubmit={handleFormSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="profile-modal-scrollbar min-h-0 flex-1 overflow-y-auto px-6 pb-2">
            <div className="space-y-6">
              {/* Sector Details */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-500 tracking-wider uppercase flex items-center">
                  <MapPin className="w-4 h-4 mr-2" /> Sector Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-slate-600">
                      Sector Name
                    </label>
                    <input
                      type="text"
                      name="sectorName"
                      value={formData.sectorName || ""}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm px-3.5 py-2 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-slate-600">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location || ""}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm px-3.5 py-2 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="sector-commander"
                    className="block text-xs font-medium text-slate-600"
                  >
                    Sector Commander
                  </label>
                  <Select
                    value={formData.sectorCommander || undefined}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        sectorCommander: value === "__none__" ? "" : value,
                      }))
                    }
                  >
                    <SelectTrigger
                      id="sector-commander"
                      className="enforcers-select-trigger h-[38px] w-full rounded-xl px-3.5 py-2 text-sm"
                    >
                      <SelectValue placeholder="Select Commander" />
                    </SelectTrigger>
                    <SelectContent className="enforcers-select-options select-slide-down bg-white">
                      <SelectItem value="__none__">No Commander</SelectItem>
                      {commanders.map((cmd) => (
                        <SelectItem key={cmd.id} value={cmd.id}>
                          {cmd.first_name} {cmd.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500">
                    Select an enforcer to be the sector commander.
                  </p>
                </div>
                <div className="space-y-2">
                  <label
                    id="assign-enforcers-label"
                    className="block text-xs font-medium text-slate-600"
                  >
                    Assign Enforcers
                  </label>
                  <Popover.Root
                    open={isEnforcerPickerOpen}
                    onOpenChange={(open) => {
                      setIsEnforcerPickerOpen(open);
                      if (!open) setEnforcerSearch("");
                    }}
                  >
                    <Popover.Trigger asChild>
                      <button
                        id="assign-enforcers"
                        type="button"
                        disabled={saving}
                        aria-labelledby="assign-enforcers-label"
                        className="enforcers-select-trigger flex h-[38px] w-full items-center justify-between rounded-xl px-3.5 py-2 text-left text-sm disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <span className={selectedLabel ? "truncate" : "truncate text-slate-400"}>
                          {selectedLabel || "Select enforcers"}
                        </span>
                        <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </button>
                    </Popover.Trigger>
                    <Popover.Portal>
                      <Popover.Content
                        align="start"
                        sideOffset={4}
                        className="enforcers-select-options enforcers-buddy-popover select-slide-down z-[190] p-0"
                        style={{ width: "var(--radix-popover-trigger-width)" }}
                      >
                        <Command className="enforcers-buddy-command" shouldFilter>
                          <div className="flex items-center border-b border-[#E2E8F0] px-3">
                            <Search className="mr-2 h-4 w-4 shrink-0 text-slate-400" />
                            <Command.Input
                              autoFocus
                              value={enforcerSearch}
                              onValueChange={setEnforcerSearch}
                              placeholder="Search enforcers..."
                              className="h-10 w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                            />
                          </div>
                          <Command.List className="max-h-56 overflow-y-auto p-1">
                            <Command.Empty className="px-3 py-5 text-center text-sm text-slate-500">
                              No enforcers found.
                            </Command.Empty>
                            <Command.Item
                              value="no enforcers assigned"
                              onSelect={clearEnforcers}
                              className="flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm text-slate-700"
                            >
                              No enforcers assigned
                              {formData.assignedEnforcers.length === 0 && (
                                <Check className="h-4 w-4" />
                              )}
                            </Command.Item>
                            {enforcers.map((enf) => {
                              const displayName = `${enf.first_name} ${enf.last_name}`;

                              return (
                                <Command.Item
                                  key={enf.id}
                                  value={`${displayName} ${enf.id}`}
                                  onSelect={() => toggleEnforcer(enf.id)}
                                  className="flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm text-slate-700"
                                >
                                  {displayName}
                                  {formData.assignedEnforcers.includes(enf.id) && (
                                    <Check className="h-4 w-4" />
                                  )}
                                </Command.Item>
                              );
                            })}
                          </Command.List>
                        </Command>
                      </Popover.Content>
                    </Popover.Portal>
                  </Popover.Root>
                  <p className="text-xs text-slate-500">
                    Select one or more enforcers to assign to this sector.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-white shrink-0 flex flex-row justify-between gap-3 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
              className="min-w-[100px]"
            >
              Cancel
            </Button>
            <button
              type="submit"
              disabled={saving || loading}
              className="bg-[#0F2744] hover:bg-[#173A64] text-white min-w-[140px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save Sector"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
