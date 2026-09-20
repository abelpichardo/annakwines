/**
 * Mejora progresiva del formulario de contacto.
 *
 * Sin JS el formulario sigue siendo un formulario válido; con JS añade:
 *   - Formateo asistido del teléfono mientras se escribe, conservando el
 *     cursor en su sitio.
 *   - Validación en línea accesible, en lugar de los globos nativos del
 *     navegador (inconsistentes entre navegadores y no traducibles).
 *   - Contador de caracteres en el área de texto.
 *
 * Los textos de error llegan por `data-msg-*` desde el servidor, ya en el
 * idioma de la página, para que este módulo no tenga que conocer la i18n.
 */

/** Máximo de dígitos de un número en formato E.164. */
const MAX_PHONE_DIGITS = 15;
const MIN_PHONE_DIGITS = 6;
const MIN_MESSAGE_LENGTH = 10;

type Messages = {
  required: string;
  email: string;
  phone: string;
  short: string;
};

/**
 * Prefijos internacionales de DOS dígitos (ITU-T E.164).
 *
 * Los prefijos miden 1, 2 o 3 dígitos y no se pueden deducir por longitud.
 * Los de un dígito son +1 y +7; el resto o está en esta tabla (dos dígitos)
 * o mide tres. Sin esto, "+1 555…" se agruparía como "+15 55…", que es un
 * número distinto a ojos de quien lo lee.
 */
const TWO_DIGIT_CODES = new Set([
  '20',
  '27',
  '30',
  '31',
  '32',
  '33',
  '34',
  '36',
  '39',
  '40',
  '41',
  '43',
  '44',
  '45',
  '46',
  '47',
  '48',
  '49',
  '51',
  '52',
  '53',
  '54',
  '55',
  '56',
  '57',
  '58',
  '60',
  '61',
  '62',
  '63',
  '64',
  '65',
  '66',
  '81',
  '82',
  '84',
  '86',
  '90',
  '91',
  '92',
  '93',
  '94',
  '95',
  '98',
]);

/** Longitud del prefijo internacional al principio de una ristra de dígitos. */
function countryCodeLength(digits: string): number {
  const first = digits.slice(0, 1);
  if (first === '1' || first === '7') return 1;
  return TWO_DIGIT_CODES.has(digits.slice(0, 2)) ? 2 : 3;
}

/**
 * Agrupa los dígitos en bloques; el resto, de tres en tres.
 *
 * `mergeTail` funde un bloque final de un solo dígito con el anterior, para
 * que un número internacional de diez cifras se lea "555 123 4567" y no
 * "555 123 456 7". Sólo se activa al terminar de escribir (ver `formatPhone`).
 */
function group(digits: string, sizes: readonly number[], mergeTail = false): string {
  const parts: string[] = [];
  let i = 0;
  for (const size of sizes) {
    if (i >= digits.length) break;
    parts.push(digits.slice(i, i + size));
    i += size;
  }
  for (let j = i; j < digits.length; j += 3) parts.push(digits.slice(j, j + 3));

  if (mergeTail && parts.length > 1 && parts[parts.length - 1]!.length === 1) {
    const last = parts.pop()!;
    parts[parts.length - 1] += last;
  }
  return parts.join(' ');
}

/**
 * Formatea un teléfono sin imponer un patrón rígido: el público es
 * internacional, así que un molde fijo rechazaría números válidos. Sólo
 * limpia lo que no son dígitos y agrupa para que se lea mejor.
 *
 * `final` se usa al salir del campo: agrupa las diez cifras finales como
 * "555 123 4567". Mientras se teclea se deja en `false`, porque esa fusión
 * haría que el texto ya escrito se reordenase a media escritura.
 */
export function formatPhone(raw: string, final = false): string {
  const international = raw.trimStart().startsWith('+');
  const digits = raw.replace(/\D/g, '').slice(0, MAX_PHONE_DIGITS);

  if (!digits) return international ? '+' : '';

  if (international) {
    const cc = digits.slice(0, countryCodeLength(digits));
    const rest = digits.slice(cc.length);
    return rest ? `+${cc} ${group(rest, [3, 3, 3], final)}` : `+${cc}`;
  }

  // Número nacional español: 9 dígitos en el patrón habitual.
  return digits.length <= 9 ? group(digits, [3, 2, 2, 2]) : group(digits, [3, 3, 3]);
}

/** Cuenta los dígitos que hay antes de una posición del texto. */
function digitsBefore(value: string, caret: number): number {
  let count = 0;
  for (let i = 0; i < caret && i < value.length; i++) {
    if (value.charCodeAt(i) >= 48 && value.charCodeAt(i) <= 57) count++;
  }
  return count;
}

/** Posición que deja el cursor justo después del n-ésimo dígito. */
function caretAfterDigits(value: string, target: number): number {
  if (target === 0) return value.startsWith('+') ? 1 : 0;
  let seen = 0;
  for (let i = 0; i < value.length; i++) {
    if (value.charCodeAt(i) >= 48 && value.charCodeAt(i) <= 57) {
      seen++;
      if (seen === target) return i + 1;
    }
  }
  return value.length;
}

/**
 * Reformatea el campo conservando el cursor: se cuenta cuántos dígitos había
 * antes del cursor y se vuelve a colocar tras esos mismos dígitos. Sin esto,
 * el cursor saltaría al final a cada pulsación.
 */
function applyPhoneMask(input: HTMLInputElement): void {
  const caret = input.selectionStart ?? input.value.length;
  const target = digitsBefore(input.value, caret);
  const formatted = formatPhone(input.value);
  if (formatted === input.value) return;
  input.value = formatted;
  const next = caretAfterDigits(formatted, target);
  input.setSelectionRange(next, next);
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

/** Devuelve el mensaje de error del campo, o null si es válido. */
function validate(control: HTMLElement, messages: Messages): string | null {
  const field = control as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
  const value = field.value.trim();

  if (field.required && !value) return messages.required;
  if (!value) return null; // Campo opcional vacío: nada que validar.

  if (field instanceof HTMLInputElement) {
    if (field.type === 'email' && !isValidEmail(value)) return messages.email;
    if (field.dataset.mask === 'phone') {
      const digits = value.replace(/\D/g, '');
      if (digits.length < MIN_PHONE_DIGITS) return messages.phone;
    }
  }

  if (field instanceof HTMLTextAreaElement && value.length < MIN_MESSAGE_LENGTH) {
    return messages.short;
  }

  return null;
}

/** Pinta o limpia el error de un campo y sincroniza `aria-invalid`. */
function setError(control: HTMLElement, message: string | null): void {
  const wrapper = control.closest<HTMLElement>('[data-field]');
  const slot = wrapper?.querySelector<HTMLElement>('[data-error]');
  if (slot) slot.textContent = message ?? '';
  if (message) control.setAttribute('aria-invalid', 'true');
  else control.removeAttribute('aria-invalid');
}

export function initContactForm(form: HTMLFormElement): void {
  const messages: Messages = {
    required: form.dataset.msgRequired ?? '',
    email: form.dataset.msgEmail ?? '',
    phone: form.dataset.msgPhone ?? '',
    short: form.dataset.msgShort ?? '',
  };

  const controls = Array.from(
    form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
      '[data-field] input, [data-field] textarea, [data-field] select'
    )
  );

  for (const control of controls) {
    // Sólo se valida al salir del campo: avisar en cada tecla mientras se
    // escribe por primera vez resulta hostil.
    control.addEventListener('blur', () => {
      // Al salir del campo se aplica el agrupado definitivo del teléfono.
      if (control instanceof HTMLInputElement && control.dataset.mask === 'phone') {
        control.value = formatPhone(control.value, true);
      }
      setError(control, validate(control, messages));
    });

    control.addEventListener('input', () => {
      if (control instanceof HTMLInputElement && control.dataset.mask === 'phone') {
        applyPhoneMask(control);
      }
      // Una vez marcado el error, sí se revalida al escribir: así el aviso
      // desaparece en cuanto se corrige, sin esperar a salir del campo.
      if (control.getAttribute('aria-invalid') === 'true') {
        setError(control, validate(control, messages));
      }
    });
  }

  // Contador de caracteres: aparece sólo cuando ya se ha escrito algo.
  const counted = form.querySelector<HTMLTextAreaElement>('textarea[maxlength]');
  const counter = form.querySelector<HTMLElement>('[data-counter]');
  if (counted && counter) {
    const update = (): void => {
      counter.textContent = counted.value ? `${counted.value.length} / ${counted.maxLength}` : '';
    };
    counted.addEventListener('input', update);
    update();
  }

  const status = form.querySelector<HTMLElement>('[data-form-status]');

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const invalid = controls.filter((control) => {
      const message = validate(control, messages);
      setError(control, message);
      return message !== null;
    });

    if (invalid.length > 0) {
      // Llevar el foco al primer problema evita que haya que buscarlo.
      invalid[0]?.focus();
      return;
    }

    // PENDIENTE: no hay backend. Se simula el envío correcto.
    status?.classList.add('show');
    form.reset();
    controls.forEach((control) => setError(control, null));
    if (counter) counter.textContent = '';
    window.setTimeout(() => status?.classList.remove('show'), 6000);
  });
}
