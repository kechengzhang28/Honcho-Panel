import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import { Loader2, Globe, ChevronDown, Check, Link2, ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useApiUrl, useConnectionTest } from "./hooks";

const apiUrlSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
});

type ApiUrlForm = z.infer<typeof apiUrlSchema>;

export function SettingsPage() {
  const { t } = useTranslation("settings");
  const { t: tc } = useTranslation("common");
  const { apiUrl, saveApiUrl } = useApiUrl();
  const { isTesting, isConnected, test, reset } = useConnectionTest();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ApiUrlForm>({
    resolver: zodResolver(apiUrlSchema),
    defaultValues: { url: apiUrl },
  });

  const currentUrl = watch("url");

  useEffect(() => {
    if (currentUrl !== apiUrl) {
      reset();
    }
  }, [currentUrl, apiUrl, reset]);

  const onSave = (data: ApiUrlForm) => {
    saveApiUrl(data.url);
  };

  const onTest = async () => {
    await test(currentUrl);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-[28px] font-bold text-[var(--color-text-primary)]">{t("title")}</h1>

      <div className="rounded-[var(--radius-md)] border border-[var(--color-border-light)] bg-[var(--color-bg)] p-6 space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">{t("apiTitle")}</h2>
          <p className="text-sm text-[var(--color-text-secondary)]">{t("apiDesc")}</p>
        </div>

        <form onSubmit={handleSubmit(onSave)} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--color-text-primary)]">{t("apiUrlLabel")}</label>
            <div className="relative">
              <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
              <Input
                {...register("url")}
                placeholder={t("apiUrlPlaceholder")}
                className="pl-10 font-mono text-sm"
              />
            </div>
            {errors.url && (
              <p className="text-sm text-[var(--color-destructive)]">{errors.url.message}</p>
            )}
          </div>

          {(isConnected === true || isConnected === false) && (
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "inline-block h-2.5 w-2.5 rounded-full",
                  isConnected ? "bg-[var(--color-success)]" : "bg-[var(--color-destructive)]",
                )}
              />
              <span className="text-sm text-[var(--color-text-secondary)]">
                {isConnected
                  ? t("connected")
                  : t("disconnected", { url: currentUrl })}
              </span>
            </div>
          )}

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onTest}
              disabled={isTesting}
            >
              {isTesting && <Loader2 className="h-4 w-4 animate-spin" />}
              {tc("button.test")}
            </Button>
            <Button type="submit">{tc("button.save")}</Button>
          </div>
        </form>
      </div>

      <div className="rounded-[var(--radius-md)] border border-[var(--color-border-light)] bg-[var(--color-bg)] p-6 space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">{t("languageTitle")}</h2>
          <p className="text-sm text-[var(--color-text-secondary)]">{t("languageDesc")}</p>
        </div>
        <LanguageSwitcher />
      </div>

      <div className="rounded-[var(--radius-md)] border border-[var(--color-border-light)] bg-[var(--color-bg)] p-6 space-y-3">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">{t("aboutTitle")}</h2>
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--color-text-secondary)]">{t("versionLabel")}</span>
          <span className="text-sm text-[var(--color-text-primary)]">{__APP_VERSION__}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--color-text-secondary)]">{t("licenseLabel")}</span>
          <span className="text-sm text-[var(--color-text-primary)]">MIT</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--color-text-secondary)]">{t("repositoryLabel")}</span>
          <a href="https://github.com/kechengzhang28/Honcho-Panel" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-[var(--color-primary)] hover:underline">
            {t("openGitHub")}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}

const languages = [
  { code: "en", label: "English" },
  { code: "zh-CN", label: "中文" },
];

function LanguageSwitcher() {
  const current = i18n.language;

  const activeLang = languages.find((l) => l.code === (current === "zh-CN" ? "zh-CN" : "en")) ?? languages[0];

  const handleChange = (code: string) => {
    i18n.changeLanguage(code);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex w-56 items-center justify-between gap-2 rounded-[var(--radius-sm)] bg-[var(--color-bg-muted)] px-3 py-2 text-sm text-[var(--color-text-primary)] hover:bg-zinc-200 transition-colors">
        <div className="flex items-center gap-2.5">
          <Globe className="h-4 w-4 text-[var(--color-text-muted)]" />
          <span>{activeLang.label}</span>
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleChange(lang.code)}
            className="flex items-center justify-between"
          >
            <span>{lang.label}</span>
            {current === lang.code && <Check className="h-4 w-4 text-[var(--color-primary)]" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
