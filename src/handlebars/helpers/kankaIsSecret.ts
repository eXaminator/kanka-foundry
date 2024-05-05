import type { AnyConstrainable } from '../../types/kanka';
import isSecret from '../../util/isSecret';

export default function kankaIsSecret(...args: [...AnyConstrainable[], Handlebars.HelperOptions]): boolean {
    args.pop(); // Remove options

    return isSecret(...(args as AnyConstrainable[]));
}
