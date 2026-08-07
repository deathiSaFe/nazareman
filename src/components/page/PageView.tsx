'use client';

import { useEffect, useState } from 'react';
import { CheckIcon, PenIcon, PlusIcon, XIcon } from '@/components/icons';
import { ActivityAreaPicker } from '@/components/add-topic/ActivityAreaPicker';
import { TopicTypesField } from '@/components/add-topic/TopicTypesField';
import { CommentForm } from '@/components/topic/CommentForm';
import {
  CONTACT_PLATFORM_LABELS,
  type ActivityAreaValue,
  type ContactPlatform,
  type PageData,
  type SelectedTopicType,
} from '@/types/topic';

interface PageViewProps {
  page: PageData;
  /** Show the inline contribution editors (image/intro/contact/social/address).
   *  True for everyone for now; later gated behind ownership. */
  editable?: boolean;
  /** Admin mode: additionally exposes identity editing, publish controls and
   *  inline moderation. */
  admin?: boolean;
}

const SOCIAL_PLATFORMS = (
  Object.keys(CONTACT_PLATFORM_LABELS) as ContactPlatform[]
).filter((platform) => platform !== 'WEBSITE');

/** A small neutral symbol per contact platform, rendered before the label. */
const PLATFORM_SYMBOL: Record<ContactPlatform, string> = {
  INSTAGRAM: '◎',
  TELEGRAM: '✈',
  WHATSAPP: '💬',
  BALE: '🟣',
  EITAA: '🟢',
  RUBIKA: '🔵',
  LINKEDIN: '💼',
  X: '𝕏',
  YOUTUBE: '▶',
  FACEBOOK: '𝔉',
  WEBSITE: '🌐',
  OTHER: '▪',
};

const inputClass =
  'w-full rounded-2xl bg-white px-4 py-3 text-[15px] font-medium text-ink-900 outline-none ring-1 ring-ink-900/10 transition-all duration-200 placeholder:font-normal placeholder:text-ink-900/30 focus:ring-2 focus:ring-turquoise-600/70';

function getAdminPassword(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  const localPassword = window.localStorage.getItem('admin_password');

  if (localPassword) {
    return localPassword;
  }

  const cookieRow = document.cookie
    .split('; ')
    .find((row) => row.startsWith('admin_password='));

  const cookieValue = cookieRow?.split('=')[1] ?? '';

  try {
    return decodeURIComponent(cookieValue);
  } catch {
    return cookieValue;
  }
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-2.5 text-[13px] font-bold text-ink-900">{children}</h2>
  );
}

/** Compact Persian date for a comment timestamp. */
function formatCommentDate(value: string): string {
  try {
    return new Date(value).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}

/** A compact, inviting add-action — used for empty sections. */
function CompactInvite({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2 rounded-2xl border border-dashed border-ink-900/20 bg-white/50 px-4 py-3 text-sm font-semibold text-ink-500 transition-colors hover:border-turquoise-600/50 hover:text-turquoise-700"
    >
      <PlusIcon strokeWidth={2.4} className="size-4 shrink-0" />
      {label}
    </button>
  );
}

function InlineEditor({
  onSave,
  onCancel,
  saving,
  saveLabel = 'ذخیره',
  children,
}: {
  onSave: () => void;
  onCancel: () => void;
  saving?: boolean;
  saveLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-turquoise-50/60 p-4 ring-1 ring-turquoise-600/20">
      {children}
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="rounded-full bg-turquoise-600 px-5 py-2 text-[13px] font-bold text-white transition-colors hover:bg-turquoise-700 disabled:opacity-50"
        >
          {saving ? 'در حال ذخیره...' : saveLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="rounded-full bg-white px-5 py-2 text-[13px] font-bold text-ink-600 ring-1 ring-ink-900/15 transition-colors hover:bg-ink-900/5 disabled:opacity-50"
        >
          انصراف
        </button>
      </div>
    </div>
  );
}

function EditLink({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-turquoise-700 transition-colors hover:text-turquoise-800"
    >
      <PenIcon strokeWidth={2.2} className="size-3.5" />
      {label}
    </button>
  );
}

function ContactRow({
  icon,
  label,
  value,
  href,
  onRemove,
}: {
  icon: string;
  label: string;
  value: string;
  href?: string;
  onRemove?: () => void;
}) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <span aria-hidden className="w-6 shrink-0 text-center text-[15px]">
        {icon}
      </span>
      <span className="shrink-0 text-[13px] font-medium text-ink-500">{label}</span>
      <span dir="ltr" className="min-w-0 flex-1 truncate text-end text-[14px] font-semibold text-ink-900">
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-turquoise-700 underline-offset-4 hover:underline"
          >
            {value}
          </a>
        ) : (
          value
        )}
      </span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`حذف ${label}`}
          className="grid size-7 shrink-0 place-items-center rounded-full text-ink-900/40 transition-colors hover:bg-ink-900/5 hover:text-ink-900/70"
        >
          <XIcon strokeWidth={2.4} className="size-3.5" />
        </button>
      )}
    </div>
  );
}

export function PageView({ page, editable = true, admin = false }: PageViewProps) {
  const [name, setName] = useState(page.name);
  const [description, setDescription] = useState(page.description ?? '');
  const [phone, setPhone] = useState(page.phone ?? '');
  const [imageUrl, setImageUrl] = useState(page.imageUrl ?? '');
  const [address, setAddress] = useState(page.address ?? '');
  const [types, setTypes] = useState<SelectedTopicType[]>(
    page.types.map((type) => ({ label: type.label, kind: type.kind }))
  );
  const [activity, setActivity] = useState<ActivityAreaValue>({
    scope: page.scope,
    provinceSlug: page.province?.slug,
    provinceName: page.province?.name,
    citySlug: page.city?.slug,
    cityName: page.city?.name,
    address: page.address ?? undefined,
  });
  const [links, setLinks] = useState<Array<{ platform: ContactPlatform; value: string }>>(
    page.links.map((link) => ({ platform: link.platform, value: link.value }))
  );
  const [comments, setComments] = useState(page.comments);
  const [status, setStatus] = useState(page.status);
  const [pendingTypes, setPendingTypes] = useState(
    page.types
      .filter(
        (type): type is typeof type & { suggestionId: string } =>
          type.suggestionStatus === 'PENDING' && Boolean(type.suggestionId)
      )
      .map((type) => ({ id: type.suggestionId, label: type.label }))
  );

  // Editor toggles
  const [imageOpen, setImageOpen] = useState(false);
  const [introOpen, setIntroOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [socialOpen, setSocialOpen] = useState(false);
  const [addressOpen, setAddressOpen] = useState(false);
  const [identityOpen, setIdentityOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  const [newPlatform, setNewPlatform] = useState<ContactPlatform>('INSTAGRAM');
  const [newLinkValue, setNewLinkValue] = useState('');
  const [websiteDraft, setWebsiteDraft] = useState('');

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Admin comment editing
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [commentEditBody, setCommentEditBody] = useState('');

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(null), 2500);
    return () => window.clearTimeout(timer);
  }, [message]);

  const websiteLink = links.find((link) => link.platform === 'WEBSITE');
  const websiteValue = websiteLink?.value ?? '';
  const socialLinks = links.filter((link) => link.platform !== 'WEBSITE');
  const showAddressBlock = activity.scope !== 'NATIONAL';
  const secondaryTypes = types.slice(1);

  const serviceAreaLabel = (() => {
    switch (activity.scope) {
      case 'PROVINCE':
        return `استان ${activity.provinceName ?? ''}`.trim();
      case 'CITY':
      case 'ADDRESS':
        return `شهر ${activity.cityName ?? ''}`.trim();
      case 'NATIONAL':
      default:
        return 'سراسر کشور';
    }
  })();

  const addressLabel = address
    ? [activity.provinceName, activity.cityName, address].filter(Boolean).join('، ')
    : null;

  function clearFeedback() {
    setMessage(null);
    setError(null);
  }

  async function savePage(fields: Record<string, unknown>) {
    clearFeedback();
    setSaving(true);

    // In admin mode all saves go through the admin endpoint so editing works
    // for pages in any state (including rejected) and uses admin auth.
    const url = admin ? `/api/admin/topics/${page.id}` : `/api/topics/${page.id}`;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (admin) {
      headers['x-admin-password'] = encodeURIComponent(getAdminPassword());
    }

    try {
      const response = await fetch(url, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(fields),
      });

      const payload = await response.json().catch(() => null);

      if (response.status === 401) {
        setError('رمز مدیریت معتبر نیست.');
        return false;
      }

      if (!response.ok) {
        setError(payload?.error ?? 'ذخیره ممکن نشد.');
        return false;
      }

      setMessage('ذخیره شد.');
      return true;
    } catch {
      setError('ذخیره ممکن نشد.');
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function saveAdmin(nextStatus?: 'APPROVED' | 'REJECTED') {
    clearFeedback();
    setSaving(true);

    const payload = {
      name: name.trim(),
      types: types.map((type) => ({ label: type.label, kind: type.kind })),
      scope: activity.scope,
      provinceSlug: activity.provinceSlug,
      citySlug: activity.citySlug,
      address: address.trim(),
      description: description.trim(),
      phone: phone.trim(),
      imageUrl: imageUrl.trim(),
      links: links.map((link) => ({ platform: link.platform, value: link.value })),
      ...(nextStatus ? { status: nextStatus } : {}),
    };

    try {
      const response = await fetch(`/api/admin/topics/${page.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': encodeURIComponent(getAdminPassword()),
        },
        body: JSON.stringify(payload),
      });

      const payloadResponse = await response.json().catch(() => null);

      if (response.status === 401) {
        setError('رمز مدیریت معتبر نیست.');
        return false;
      }

      if (!response.ok) {
        setError(payloadResponse?.error ?? 'ذخیره ممکن نشد.');
        return false;
      }

      if (nextStatus) {
        setStatus(nextStatus);
        setMessage(nextStatus === 'APPROVED' ? 'صفحه منتشر شد.' : 'صفحه رد شد.');
      } else {
        setMessage('تغییرات ذخیره شد.');
      }

      return true;
    } catch {
      setError('ذخیره ممکن نشد.');
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function moderateComment(
    id: string,
    changes: { status?: 'APPROVED' | 'REJECTED'; body?: string }
  ) {
    clearFeedback();

    try {
      const response = await fetch(`/api/admin/comments/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': encodeURIComponent(getAdminPassword()),
        },
        body: JSON.stringify(changes),
      });

      const payload = await response.json().catch(() => null);

      if (response.status === 401) {
        setError('رمز مدیریت معتبر نیست.');
        return;
      }

      if (!response.ok) {
        setError(payload?.error ?? 'عملیات ممکن نشد.');
        return;
      }

      setComments((prev) =>
        prev.map((comment) =>
          comment.id === id
            ? {
                ...comment,
                ...(changes.status !== undefined ? { status: changes.status } : {}),
                ...(changes.body !== undefined ? { body: changes.body } : {}),
              }
            : comment
        )
      );

      setEditingCommentId(null);
      setMessage('نظر به‌روزرسانی شد.');
    } catch {
      setError('عملیات ممکن نشد.');
    }
  }

  async function approveType(suggestionId: string) {
    clearFeedback();

    try {
      const response = await fetch(`/api/admin/topic-types/${suggestionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': encodeURIComponent(getAdminPassword()),
        },
        body: JSON.stringify({ status: 'APPROVED' }),
      });

      if (!response.ok) {
        setError('تأیید نوع ممکن نشد.');
        return;
      }

      setPendingTypes((prev) => prev.filter((item) => item.id !== suggestionId));
      setMessage('نوع تأیید شد و به پیشنهادها اضافه شد.');
    } catch {
      setError('عملیات ممکن نشد.');
    }
  }

  const saveContact = async () => {
    const otherLinks = links.filter((link) => link.platform !== 'WEBSITE');
    const nextLinks = websiteDraft.trim()
      ? [...otherLinks, { platform: 'WEBSITE' as const, value: websiteDraft.trim() }]
      : otherLinks;

    setLinks(nextLinks);
    const ok = await savePage({ phone: phone.trim(), links: nextLinks });
    if (ok) setContactOpen(false);
  };

  const saveSocial = async () => {
    const value = newLinkValue.trim();
    if (!value) return;

    const nextLinks = [...links, { platform: newPlatform, value }];
    setLinks(nextLinks);
    const ok = await savePage({ links: nextLinks });
    if (ok) {
      setNewLinkValue('');
      setSocialOpen(false);
    }
  };

  const removeLink = async (index: number) => {
    const nextLinks = links.filter((_, itemIndex) => itemIndex !== index);
    setLinks(nextLinks);
    await savePage({ links: nextLinks });
  };

  const saveImage = async () => {
    const ok = await savePage({ imageUrl: imageUrl.trim() });
    if (ok) setImageOpen(false);
  };

  const saveIntro = async () => {
    const ok = await savePage({ description: description.trim() });
    if (ok) setIntroOpen(false);
  };

  const saveAddress = async () => {
    const ok = await savePage({ address: address.trim() });
    if (ok) setAddressOpen(false);
  };

  const statusLabel =
    status === 'APPROVED' ? 'منتشر شده' : status === 'REJECTED' ? 'رد شده' : 'در انتظار بررسی';

  const resetIdentity = () => {
    setIdentityOpen(false);
    setName(page.name);
    setTypes(page.types.map((type) => ({ label: type.label, kind: type.kind })));
    setActivity({
      scope: page.scope,
      provinceSlug: page.province?.slug,
      provinceName: page.province?.name,
      citySlug: page.city?.slug,
      cityName: page.city?.name,
      address: page.address ?? undefined,
    });
    setAddress(page.address ?? '');
  };

  return (
    <div className="space-y-5">
      {(admin || status !== 'APPROVED') && (
        <div className="flex justify-center">
          <span
            className={`rounded-full px-4 py-1.5 text-xs font-bold ${
              status === 'APPROVED'
                ? 'bg-emerald-600/10 text-emerald-700'
                : status === 'REJECTED'
                  ? 'bg-red-600/10 text-red-700'
                  : 'bg-saffron-500/10 text-saffron-700'
            }`}
          >
            {statusLabel}
          </span>
        </div>
      )}

      {message && (
        <div className="rounded-2xl bg-turquoise-600/10 p-3 text-center text-sm text-turquoise-700">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-2xl bg-red-50 p-3 text-center text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ————————————————— MAIN PROFILE FRAME ————————————————— */}
      <article className="overflow-hidden rounded-[28px] bg-white ring-1 ring-ink-900/[0.06] shadow-[0_10px_30px_-14px_rgba(21,67,63,0.3)]">
        {/* ——— Cover: image is the dominant visual ——— */}
        <div className="relative">
          {imageUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt={name}
                className="h-52 w-full object-cover md:h-72"
              />

              {/* Readability gradient spans the whole cover so the name stays
                  legible regardless of the image. */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/65 via-black/25 to-transparent" />

              {/* Name (dominant) + primary type (small tag above it) */}
              <div className="absolute inset-x-0 top-0 flex flex-col items-start gap-3 p-5 md:p-7">
                <span className="rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold text-ink-900 shadow-sm md:text-xs">
                  {types[0]?.label ?? 'بدون نوع'}
                </span>
                <h1 className="font-display text-[26px] leading-9 text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.55)] md:text-4xl md:leading-[3rem]">
                  {name}
                </h1>
              </div>

              {editable && (
                <button
                  type="button"
                  onClick={() => setImageOpen(true)}
                  className="absolute bottom-3 right-4 inline-flex items-center gap-1.5 rounded-full bg-black/45 px-4 py-2 text-[12px] font-bold text-white ring-1 ring-white/20 backdrop-blur transition-colors hover:bg-black/60"
                >
                  <PenIcon strokeWidth={2.2} className="size-3.5" />
                  ویرایش تصویر
                </button>
              )}
            </>
          ) : (
            <div className="flex min-h-44 flex-col bg-gradient-to-br from-turquoise-900 via-turquoise-800 to-ink-900 px-5 pb-6 pt-5 md:min-h-56 md:px-7 md:pb-7 md:pt-7">
              <span className="self-start rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold text-white ring-1 ring-white/20 backdrop-blur md:text-xs">
                {types[0]?.label ?? 'بدون نوع'}
              </span>

              <h1 className="mt-3 font-display text-[26px] leading-9 text-white md:text-4xl md:leading-[3rem]">
                {name}
              </h1>

              <div className="mt-auto flex justify-center pt-6">
                {editable && !imageOpen && (
                  <button
                    type="button"
                    onClick={() => setImageOpen(true)}
                    className="inline-flex items-center gap-2 rounded-full bg-white/15 px-5 py-2.5 text-[13px] font-bold text-white ring-1 ring-white/25 backdrop-blur transition-colors hover:bg-white/25"
                  >
                    <PlusIcon strokeWidth={2.6} className="size-4" />
                    افزودن تصویر
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ——— Profile body ——— */}
        <div className="p-5 md:p-7">
          {editable && imageOpen && (
            <InlineEditor onSave={() => void saveImage()} onCancel={() => setImageOpen(false)} saving={saving}>
              <input
                type="text"
                value={imageUrl}
                onChange={(event) => setImageUrl(event.target.value)}
                placeholder="https://..."
                dir="ltr"
                className={inputClass}
              />
            </InlineEditor>
          )}

          {/* Secondary types — subtle chips */}
          {secondaryTypes.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-1.5">
              {secondaryTypes.map((type, index) => (
                <span
                  key={`${type.label}-${index}`}
                  className="rounded-full bg-turquoise-600/10 px-3 py-1 text-[12px] font-semibold text-turquoise-700"
                >
                  {type.label}
                </span>
              ))}
            </div>
          )}

          {/* Admin identity editing */}
          {admin && (
            <div className="mb-5">
              {!identityOpen ? (
                <EditLink label="ویرایش نام، نوع‌ها و محدوده فعالیت" onClick={() => setIdentityOpen(true)} />
              ) : (
                <div className="space-y-5 rounded-2xl bg-ink-900/[0.02] p-4 ring-1 ring-ink-900/[0.06]">
                  <label className="block">
                    <span className="mb-2 block text-[13px] font-bold text-ink-900">نام صفحه</span>
                    <input
                      type="text"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      className={inputClass}
                    />
                  </label>

                  <TopicTypesField value={types} onChange={setTypes} />

                  <ActivityAreaPicker value={activity} onChange={setActivity} showAddress={false} />

                  <label className="block">
                    <span className="mb-2 block text-[13px] font-bold text-ink-900">آدرس</span>
                    <input
                      type="text"
                      value={address}
                      onChange={(event) => setAddress(event.target.value)}
                      className={inputClass}
                    />
                  </label>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => void saveAdmin()}
                      disabled={saving}
                      className="rounded-full bg-turquoise-600 px-5 py-2 text-[13px] font-bold text-white transition-colors hover:bg-turquoise-700 disabled:opacity-50"
                    >
                      {saving ? 'در حال ذخیره...' : 'ذخیره'}
                    </button>
                    <button
                      type="button"
                      onClick={resetIdentity}
                      disabled={saving}
                      className="rounded-full bg-white px-5 py-2 text-[13px] font-bold text-ink-600 ring-1 ring-ink-900/15 transition-colors hover:bg-ink-900/5 disabled:opacity-50"
                    >
                      انصراف
                    </button>
                  </div>

                  {pendingTypes.length > 0 && (
                    <div className="rounded-2xl bg-saffron-50 p-4 ring-1 ring-saffron-200/60">
                      <p className="text-[13px] font-bold text-ink-800">
                        این نوع‌ها جدید هستند و در انتظار بررسی‌اند:
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {pendingTypes.map((item) => (
                          <span
                            key={item.id}
                            className="inline-flex items-center gap-2 rounded-full bg-white py-1.5 ps-3 pe-1.5 text-[13px] font-semibold text-ink-800 ring-1 ring-ink-900/10"
                          >
                            {item.label}
                            <button
                              type="button"
                              onClick={() => void approveType(item.id)}
                              className="grid size-5 place-items-center rounded-full bg-turquoise-600 text-white transition-colors hover:bg-turquoise-700"
                              aria-label={`تأیید نوع «${item.label}»`}
                            >
                              <CheckIcon strokeWidth={3} className="size-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ——— Section 1 · Introduction ——— */}
          <section className="border-b border-ink-900/[0.08] py-4">
            <SectionTitle>معرفی</SectionTitle>

            {description ? (
              <>
                <p className="whitespace-pre-line text-[14px] leading-7 text-ink-700">
                  {description}
                </p>
                {editable && (
                  <div className="mt-2">
                    <EditLink label="ویرایش معرفی" onClick={() => setIntroOpen(true)} />
                    {introOpen && (
                      <InlineEditor
                        onSave={() => void saveIntro()}
                        onCancel={() => setIntroOpen(false)}
                        saving={saving}
                      >
                        <textarea
                          value={description}
                          onChange={(event) => setDescription(event.target.value)}
                          rows={5}
                          maxLength={500}
                          className={`${inputClass} resize-none leading-7`}
                        />
                      </InlineEditor>
                    )}
                  </div>
                )}
              </>
            ) : editable ? (
              introOpen ? (
                <InlineEditor
                  onSave={() => void saveIntro()}
                  onCancel={() => setIntroOpen(false)}
                  saving={saving}
                >
                  <textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    rows={5}
                    maxLength={500}
                    placeholder="یک یا دو جمله درباره این صفحه..."
                    className={`${inputClass} resize-none leading-7`}
                  />
                </InlineEditor>
              ) : (
                <CompactInvite label="افزودن معرفی" onClick={() => setIntroOpen(true)} />
              )
            ) : (
              <p className="text-[14px] text-ink-400">معرفی‌ای ثبت نشده است.</p>
            )}
          </section>

          {/* ——— Section 2 · Important information ——— */}
          <section className="border-b border-ink-900/[0.08] py-4">
            <SectionTitle>اطلاعات مهم</SectionTitle>

            <div className="divide-y divide-ink-900/[0.06]">
              {/* Service area */}
              <div className="flex items-baseline justify-between gap-4 py-2.5">
                <dt className="shrink-0 text-[13px] font-medium text-ink-500">
                  محدوده خدمات‌دهی
                </dt>
                <dd className="text-end text-[14px] font-semibold text-ink-900">
                  {serviceAreaLabel}
                </dd>
              </div>

              {/* Working hours — placeholder for future functionality */}
              <div className="flex items-baseline justify-between gap-4 py-2.5">
                <dt className="shrink-0 text-[13px] font-medium text-ink-500">ساعت کاری</dt>
                <dd className="text-end text-[14px] font-semibold text-ink-400">
                  ثبت نشده
                </dd>
              </div>

              {/* Address */}
              <div className="py-2.5">
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="shrink-0 text-[13px] font-medium text-ink-500">آدرس</dt>
                  <dd className="text-end text-[14px] font-semibold text-ink-900">
                    {addressLabel ? (
                      addressLabel
                    ) : (
                      <span className="font-medium text-ink-400">
                        آدرسی برای این مورد ثبت نشده.
                      </span>
                    )}
                  </dd>
                </div>

                {editable && !admin && showAddressBlock && (
                  <div className="mt-2">
                    {!addressOpen ? (
                      <EditLink
                        label={address ? 'ویرایش آدرس' : 'افزودن آدرس'}
                        onClick={() => setAddressOpen(true)}
                      />
                    ) : (
                      <InlineEditor
                        onSave={() => void saveAddress()}
                        onCancel={() => setAddressOpen(false)}
                        saving={saving}
                      >
                        <input
                          type="text"
                          value={address}
                          onChange={(event) => setAddress(event.target.value)}
                          placeholder="خیابان، کوچه، پلاک"
                          className={inputClass}
                        />
                      </InlineEditor>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ——— Section 3 · Contact information ——— */}
          <section className="pt-4">
            <SectionTitle>اطلاعات تماس</SectionTitle>

            {phone || websiteLink || socialLinks.length > 0 ? (
              <div className="divide-y divide-ink-900/[0.06]">
                {phone && <ContactRow icon="☎" label="تلفن" value={phone} href={`tel:${phone}`} />}
                {websiteLink && (
                  <ContactRow
                    icon="🌐"
                    label="وب‌سایت"
                    value={websiteLink.value}
                    href={
                      /^https?:\/\//i.test(websiteLink.value)
                        ? websiteLink.value
                        : `https://${websiteLink.value}`
                    }
                  />
                )}
                {socialLinks.map((link, index) => (
                  <ContactRow
                    key={`${link.platform}-${index}`}
                    icon={PLATFORM_SYMBOL[link.platform]}
                    label={CONTACT_PLATFORM_LABELS[link.platform]}
                    value={link.value}
                    onRemove={editable ? () => void removeLink(index) : undefined}
                  />
                ))}
              </div>
            ) : editable ? (
              <CompactInvite
                label="افزودن اطلاعات تماس"
                onClick={() => {
                  setContactOpen(true);
                  setWebsiteDraft(websiteValue);
                }}
              />
            ) : (
              <p className="text-[14px] text-ink-400">اطلاعات تماسی ثبت نشده است.</p>
            )}

            {editable && (
              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-3">
                {!contactOpen ? (
                  <EditLink
                    label={phone || websiteLink ? 'ویرایش تلفن و وب‌سایت' : 'افزودن تلفن و وب‌سایت'}
                    onClick={() => {
                      setContactOpen(true);
                      setWebsiteDraft(websiteValue);
                    }}
                  />
                ) : (
                  <InlineEditor
                    onSave={() => void saveContact()}
                    onCancel={() => setContactOpen(false)}
                    saving={saving}
                  >
                    <div className="space-y-3">
                      <input
                        type="tel"
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                        placeholder="شماره تلفن"
                        dir="ltr"
                        className={inputClass}
                      />
                      <input
                        type="text"
                        value={websiteDraft}
                        onChange={(event) => setWebsiteDraft(event.target.value)}
                        placeholder="وب‌سایت"
                        dir="ltr"
                        className={inputClass}
                      />
                    </div>
                  </InlineEditor>
                )}

                {!socialOpen ? (
                  <EditLink label="افزودن شبکه اجتماعی" onClick={() => setSocialOpen(true)} />
                ) : (
                  <InlineEditor
                    onSave={() => void saveSocial()}
                    onCancel={() => setSocialOpen(false)}
                    saving={saving}
                  >
                    <div className="space-y-3">
                      <select
                        value={newPlatform}
                        onChange={(event) => setNewPlatform(event.target.value as ContactPlatform)}
                        aria-label="پلتفرم"
                        className={`${inputClass} appearance-none`}
                      >
                        {SOCIAL_PLATFORMS.map((platform) => (
                          <option key={platform} value={platform}>
                            {CONTACT_PLATFORM_LABELS[platform]}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={newLinkValue}
                        onChange={(event) => setNewLinkValue(event.target.value)}
                        placeholder="نام کاربری یا نشانی"
                        dir="ltr"
                        className={inputClass}
                      />
                    </div>
                  </InlineEditor>
                )}
              </div>
            )}
          </section>

          {/* Admin actions */}
          {admin && (
            <section className="mt-5 space-y-2.5 border-t border-ink-900/[0.08] pt-5">
              <button
                type="button"
                onClick={() => void saveAdmin()}
                disabled={saving}
                className="w-full rounded-full bg-white px-7 py-3 text-[15px] font-bold text-ink-900 ring-1 ring-ink-900/15 transition-all duration-200 hover:ring-turquoise-600/50 hover:text-turquoise-700 disabled:opacity-50"
              >
                {saving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
              </button>

              <button
                type="button"
                onClick={() => void saveAdmin('APPROVED')}
                disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-turquoise-600 px-7 py-3 text-[15px] font-bold text-white shadow-[0_10px_24px_-10px_rgba(26,99,93,0.55)] transition-all duration-200 hover:bg-turquoise-700 disabled:opacity-50"
              >
                <CheckIcon strokeWidth={2.6} className="size-5" />
                انتشار صفحه
              </button>

              <button
                type="button"
                onClick={() => void saveAdmin('REJECTED')}
                disabled={saving}
                className="w-full rounded-full bg-white px-7 py-3 text-[15px] font-bold text-red-700 ring-1 ring-red-200 transition-all duration-200 hover:bg-red-50 disabled:opacity-50"
              >
                رد صفحه
              </button>
            </section>
          )}
        </div>
      </article>

      {/* ————————————————— COMMENTS FRAME ————————————————— */}
      <section className="rounded-[28px] bg-white p-5 ring-1 ring-ink-900/[0.06] shadow-[0_10px_30px_-14px_rgba(21,67,63,0.3)] md:p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-xl text-ink-900">نظرات</h2>
          <button
            type="button"
            onClick={() => setFormOpen((open) => !open)}
            className="rounded-full bg-turquoise-600 px-5 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-turquoise-700"
          >
            ثبت نظر
          </button>
        </div>

        {comments.length > 0 && (
          <div className="mt-4 divide-y divide-ink-900/[0.06]">
            {comments.map((comment) => {
              const isPending = comment.status === 'PENDING';
              const isEditing = editingCommentId === comment.id;

              return (
                <article
                  key={comment.id}
                  className={`py-4 ${isPending ? 'border-s-4 border-red-400 ps-3' : ''}`}
                >
                  {admin && isEditing ? (
                    <div>
                      <textarea
                        value={commentEditBody}
                        onChange={(event) => setCommentEditBody(event.target.value)}
                        rows={3}
                        className={`${inputClass} resize-none`}
                      />
                      <div className="mt-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => void moderateComment(comment.id, { body: commentEditBody.trim() })}
                          className="rounded-full bg-turquoise-600 px-5 py-2 text-xs font-bold text-white transition-colors hover:bg-turquoise-700"
                        >
                          ذخیره
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCommentId(null);
                            setCommentEditBody('');
                          }}
                          className="rounded-full bg-white px-5 py-2 text-xs font-bold text-ink-600 ring-1 ring-ink-900/15 transition-colors hover:bg-ink-900/5"
                        >
                          انصراف
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="whitespace-pre-line text-[14px] leading-7 text-ink-800">
                        {comment.body}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                        {comment.createdAt && (
                          <span className="text-[11px] text-ink-400">
                            {formatCommentDate(comment.createdAt)}
                          </span>
                        )}
                        {comment.status === 'PENDING' && (
                          <span className="rounded-full bg-red-600/10 px-2.5 py-0.5 text-[12px] font-bold text-red-700">
                            در انتظار بررسی
                          </span>
                        )}
                        {comment.status === 'APPROVED' && (
                          <span className="rounded-full bg-emerald-600/10 px-2.5 py-0.5 text-[12px] font-bold text-emerald-700">
                            تأییدشده
                          </span>
                        )}
                        {comment.status === 'REJECTED' && (
                          <span className="rounded-full bg-ink-900/5 px-2.5 py-0.5 text-[12px] font-bold text-ink-500">
                            رد شده
                          </span>
                        )}

                        {admin && (
                          <div className="ms-auto flex gap-2">
                            {comment.status !== 'APPROVED' && (
                              <button
                                type="button"
                                onClick={() => void moderateComment(comment.id, { status: 'APPROVED' })}
                                className="rounded-full bg-turquoise-600 px-4 py-1.5 text-xs font-bold text-white transition-colors hover:bg-turquoise-700"
                              >
                                تأیید
                              </button>
                            )}
                            {comment.status !== 'REJECTED' && (
                              <button
                                type="button"
                                onClick={() => void moderateComment(comment.id, { status: 'REJECTED' })}
                                className="rounded-full bg-white px-4 py-1.5 text-xs font-bold text-red-700 ring-1 ring-red-200 transition-colors hover:bg-red-50"
                              >
                                رد
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCommentId(comment.id);
                                setCommentEditBody(comment.body);
                              }}
                              className="grid size-8 place-items-center rounded-full bg-ink-900/5 text-ink-600 transition-colors hover:bg-ink-900/10"
                              aria-label="ویرایش نظر"
                            >
                              <PenIcon strokeWidth={2.2} className="size-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </article>
              );
            })}
          </div>
        )}

        {formOpen && (
          <div id="page-comment-form" className="mt-5 border-t border-ink-900/[0.06] pt-5">
            <CommentForm topicId={page.id} autoFocus />
          </div>
        )}
      </section>
    </div>
  );
}
