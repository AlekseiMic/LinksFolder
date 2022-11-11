export const linkRegexComplex = new RegExp(
  /^ *(?:(https?:\/\/(?:www\.)?[-\w@:%._\+~#=]{1,256}\.[\w()]{1,6}(?:[-\w()@:%_\+.~#?&/=]*)) *([-_@$!%^&*() \w]*)((?: *#[-\w_]+)*) *)*$/
);

export const linkRegex = new RegExp(
  /^https?:\/\/(?:www\.)?[-\w@:%._\+~#=]{1,256}\.[\w()]{1,6}(?:[-\w()@:%_\+.~#?&/=]*)$/
);
