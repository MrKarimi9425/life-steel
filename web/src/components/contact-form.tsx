"use client";
import { useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { siteCopy } from "@/lib/site-content-copy";
const names = ["name", "phone", "email", "subject", "message"] as const;
type Values = Record<(typeof names)[number], string>;
const subscribeToHydration = () => () => undefined;
const clientReady = () => true;
const serverReady = () => false;
export function ContactForm({ locale }: { locale: string }) {
  const t = siteCopy(locale);
  const [values, setValues] = useState<Values>({
    name: "",
    phone: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<Partial<Values>>({});
  const [state, setState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const pending = useRef(false);
  const ready = useSyncExternalStore(subscribeToHydration, clientReady, serverReady);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current) return;
    const phone = values.phone
      .replace(/[۰-۹٠-٩]/g, (digit) =>
        String(digit.charCodeAt(0) - (digit.charCodeAt(0) >= 0x6f0 ? 0x6f0 : 0x660)),
      )
      .replace(/[ ()-]/g, "");
    const found: Partial<Values> = {};
    for (const key of ["name", "subject", "message"] as const)
      if (!values[key].trim()) found[key] = t.required;
    if (values.name.trim().length < 2) found.name = t.required;
    if (values.subject.trim().length < 2) found.subject = t.required;
    if (!/^\+?[0-9]{7,15}$/.test(phone)) found.phone = t.invalidPhone;
    if (values.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()))
      found.email = t.invalidEmail;
    if (values.message.trim().length < 5) found.message = t.invalidMessage;
    setErrors(found);
    if (Object.keys(found).length) {
      document.getElementById(`contact-${Object.keys(found)[0]}`)?.focus();
      return;
    }
    pending.current = true;
    setState("sending");
    try {
      const response = await fetch("/api/contact-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          phone,
          email: values.email.trim() || undefined,
        }),
      });
      if (!response.ok) throw new Error("send");
      setState("success");
      setValues({ name: "", phone: "", email: "", subject: "", message: "" });
    } catch {
      setState("error");
    } finally {
      pending.current = false;
    }
  }
  return (
    <section className="contact-form-panel" aria-labelledby="contact-form-title">
      <div className="contact-form-heading">
        <span className="eyebrow">LIFE STEEL / MESSAGE</span>
        <h2 id="contact-form-title">{t.formTitle}</h2>
        <p>{t.formIntro}</p>
      </div>
      <form noValidate method="post" action="/api/contact-message" onSubmit={submit}>
        <fieldset disabled={state === "sending"}>
          <div className="contact-form-grid">
            {names.map((name) => (
              <div
                className={`contact-field ${["subject", "message"].includes(name) ? "full" : ""}`}
                key={name}
              >
                <label htmlFor={`contact-${name}`}>
                  {t[name]}
                  {name !== "email" && <span aria-hidden="true"> *</span>}
                </label>
                {name === "message" ? (
                  <textarea
                    id={`contact-${name}`}
                    name={name}
                    required
                    maxLength={10000}
                    rows={5}
                    value={values[name]}
                    onChange={(e) => setValues((v) => ({ ...v, [name]: e.target.value }))}
                    aria-invalid={Boolean(errors[name])}
                    aria-describedby={errors[name] ? `${name}-error` : undefined}
                  />
                ) : (
                  <input
                    id={`contact-${name}`}
                    name={name}
                    type={name === "email" ? "email" : name === "phone" ? "tel" : "text"}
                    dir={name === "email" || name === "phone" ? "ltr" : undefined}
                    autoComplete={
                      name === "name"
                        ? "name"
                        : name === "phone"
                          ? "tel"
                          : name === "email"
                            ? "email"
                            : undefined
                    }
                    required={name !== "email"}
                    maxLength={
                      name === "name" ? 150 : name === "phone" ? 30 : name === "subject" ? 200 : 255
                    }
                    value={values[name]}
                    onChange={(e) => setValues((v) => ({ ...v, [name]: e.target.value }))}
                    aria-invalid={Boolean(errors[name])}
                    aria-describedby={errors[name] ? `${name}-error` : undefined}
                  />
                )}
                {errors[name] && (
                  <p id={`${name}-error`} className="contact-field-error">
                    {errors[name]}
                  </p>
                )}
              </div>
            ))}
          </div>
          <button type="submit" disabled={!ready} className="contact-submit">
            {state === "sending" ? t.sending : t.submit}
            <span aria-hidden="true">↗</span>
          </button>
        </fieldset>
        <p role="status" aria-live="polite" className={`contact-form-status ${state}`}>
          {state === "success" ? t.success : state === "error" ? t.error : ""}
        </p>
      </form>
    </section>
  );
}
