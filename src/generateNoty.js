import Noty from 'noty';
import 'noty/lib/noty.css';

export default function generateNoty(text, type = 'information') {
  return new Noty({
    text: text,
    type: type,
    dismissQueue: true,
    layout: 'topCenter',
    closeWith: ['click', 'button'],
    timeout: 5000
  }).show();
};
