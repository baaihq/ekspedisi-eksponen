import React, { useState } from 'react';
import { Users, Plus, Trash2, ArrowRight } from 'lucide-react';
import { TeamData, TeamRole } from '../types/game';
import { createGroupSeed } from '../lib/seed';
import { GameImage } from '../components/common/GameImage';
import { audioManager } from '../audio/audioManager';

interface SetupSceneProps {
  onComplete: (team: TeamData) => void;
  initialData?: TeamData | null;
}

const TEAM_COLORS = [
  { id: 'cyan', hex: '#0284c7', label: 'Biru Cyber' },
  { id: 'emerald', hex: '#059669', label: 'Hijau Biosfer' },
  { id: 'violet', hex: '#7c3aed', label: 'Ungu Quantum' },
  { id: 'amber', hex: '#d97706', label: 'Kuning Surya' },
  { id: 'rose', hex: '#e11d48', label: 'Merah Laser' },
];

const ROLES: TeamRole[] = [
  'Navigator',
  'Penghitung',
  'Pemeriksa',
  'Pencatat',
  'Penjelas',
];

export const SetupScene: React.FC<SetupSceneProps> = ({ onComplete, initialData }) => {
  const [teamName, setTeamName] = useState(initialData?.name || '');
  const [selectedColor, setSelectedColor] = useState(initialData?.color || TEAM_COLORS[0].hex);
  const [sessionCode, setSessionCode] = useState(initialData?.sessionCode || '');

  const [members, setMembers] = useState<{ id: string; name: string; role: TeamRole }[]>(() => {
    if (initialData?.members && initialData.members.length >= 3) {
      return initialData.members;
    }
    return [
      { id: 'm1', name: '', role: 'Navigator' },
      { id: 'm2', name: '', role: 'Penghitung' },
      { id: 'm3', name: '', role: 'Pemeriksa' },
    ];
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAddMember = () => {
    if (members.length >= 5) return;
    audioManager.playSfx('click');
    const nextRole = ROLES[members.length] || 'Anggota';
    setMembers([
      ...members,
      {
        id: `m${Date.now()}`,
        name: '',
        role: nextRole,
      },
    ]);
  };

  const handleRemoveMember = (idx: number) => {
    if (members.length <= 3) {
      setErrorMessage('Tim ekspedisi harus terdiri dari minimal 3 anggota.');
      return;
    }
    audioManager.playSfx('click');
    setErrorMessage(null);
    setMembers(members.filter((_, i) => i !== idx));
  };

  const handleMemberChange = (idx: number, field: 'name' | 'role', val: string) => {
    const updated = [...members];
    updated[idx] = { ...updated[idx], [field]: val };
    setMembers(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    audioManager.unlockAudio();

    if (!teamName.trim()) {
      setErrorMessage('Nama kelompok wajib diisi untuk memulai ekspedisi.');
      audioManager.playSfx('wrong');
      return;
    }

    if (members.length < 3) {
      setErrorMessage('Jumlah anggota minimal 3 orang.');
      audioManager.playSfx('wrong');
      return;
    }

    setErrorMessage(null);
    audioManager.playSfx('generator_active');

    // Fill blank names with clear numbered placeholders if student left blank
    const cleanMembers = members.map((m, idx) => ({
      ...m,
      name: m.name.trim() || `Anggota ${idx + 1} (${m.role})`,
    }));

    const seed = createGroupSeed(teamName);

    const newTeam: TeamData = {
      id: initialData?.id || `team_${Date.now()}_${seed}`,
      name: teamName.trim(),
      color: selectedColor,
      seed,
      sessionCode: sessionCode.trim().toUpperCase() || undefined,
      members: cleanMembers,
      createdAt: initialData?.createdAt || new Date().toISOString(),
    };

    onComplete(newTeam);
  };

  return (
    <div className="w-full">
      {/* Large White Card with 24-28px radius */}
      <div className="overflow-hidden rounded-[26px] bg-white shadow-xl shadow-slate-200/50 border border-slate-100 dark:bg-slate-900 dark:border-slate-800 dark:shadow-none transition-all">
        {/* Top Image with Gradient Overlay Caption */}
        <GameImage
          src="/img/ilustrasi-preangkatan.jpg"
          alt="Tim Penyelamat Kota Data"
          caption="Tim Penyelamat Kota Data"
          aspectRatio="16/9"
          themeType="team"
        />

        <div className="p-5 sm:p-7">
          {/* Label and Title */}
          <div className="mb-4">
            <span className="inline-block rounded-full bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
              Persiapan Tim
            </span>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Bentuk Tim Ekspedisi
            </h1>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Kota Data membutuhkan kerja sama tim yang tangguh. Diskusikan nama kelompok, pilih warna bendera, dan tentukan peran 3–5 anggota tim kalian.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Input Nama Kelompok */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Nama Kelompok <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => {
                  setTeamName(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="Contoh: Tim Sigma Eksponen"
                className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
              />
              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                Nama kelompok digunakan untuk menentukan seed variasi soal secara adil.
              </p>
            </div>

            {/* Pilihan Warna Tim Berbentuk Lingkaran */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Warna Lambang Tim
              </label>
              <div className="flex items-center gap-3">
                {TEAM_COLORS.map((color) => {
                  const isSelected = selectedColor === color.hex;
                  return (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => {
                        setSelectedColor(color.hex);
                        audioManager.playSfx('click');
                      }}
                      className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-transform active:scale-90 ${
                        isSelected ? 'scale-110 ring-3 ring-indigo-600 ring-offset-2 dark:ring-offset-slate-900' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.label}
                    >
                      {isSelected && (
                        <span className="block h-2.5 w-2.5 rounded-full bg-white shadow-xs" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Kode Sesi Kelas Guru (Opsional) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Kode Sesi Kelas (Opsional)
              </label>
              <input
                type="text"
                value={sessionCode}
                onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                placeholder="Contoh: KOTA-DATA-01"
                className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-4 py-2.5 text-xs text-slate-900 dark:text-white uppercase placeholder:normal-case placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none transition"
              />
            </div>

            {/* Anggota Tim (3–5 Orang) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-indigo-500" />
                  <span>Daftar Anggota & Peran (3–5 Orang)</span>
                </label>
                <span className="text-[11px] font-semibold text-slate-500">
                  {members.length} / 5 Anggota
                </span>
              </div>

              <div className="space-y-2.5">
                {members.map((member, idx) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/60 dark:bg-slate-800/40 p-2.5"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-slate-200 dark:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300">
                      {idx + 1}
                    </span>

                    <input
                      type="text"
                      value={member.name}
                      onChange={(e) => handleMemberChange(idx, 'name', e.target.value)}
                      placeholder={`Nama Anggota ${idx + 1}`}
                      className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />

                    <select
                      value={member.role}
                      onChange={(e) => handleMemberChange(idx, 'role', e.target.value as TeamRole)}
                      className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>

                    {members.length > 3 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                        title="Hapus anggota"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {members.length < 5 && (
                <button
                  type="button"
                  onClick={handleAddMember}
                  className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 py-2.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 transition cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Tambah Anggota ({members.length + 1})</span>
                </button>
              )}
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 p-3 text-xs font-medium text-rose-700 dark:text-rose-300">
                {errorMessage}
              </div>
            )}

            {/* Navy Full-Width Button */}
            <button
              type="submit"
              className="mt-3 flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 dark:bg-indigo-600 text-sm font-bold text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800 dark:hover:bg-indigo-500 active:scale-98 transition cursor-pointer"
            >
              <span>Mulai Ekspedisi 🚀</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
