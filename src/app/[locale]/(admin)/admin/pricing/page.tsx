import {requireStaff} from '@/lib/admin';
import {OFFERS, isCheckoutConfigured} from '@/lib/offer';

export default async function Pricing() {
  await requireStaff(true);
  return (<div><h1 className="mb-1 font-serif text-3xl font-bold">Country offers</h1>
    <p className="mb-4 text-sm text-mute">Prices and external checkout links are managed in one place: <code>src/lib/offer.ts</code>. Edit the OFFERS block and deploy. Language selection remains independent from the country offer.</p>
    <div className="overflow-x-auto"><table className="tbl"><thead><tr><th>Country</th><th>Currency</th><th>Price</th><th>Old price</th><th>Checkout</th></tr></thead><tbody>
      {Object.entries(OFFERS).map(([country, offer]) => <tr key={country}><td>{country}</td><td>{offer.currency}</td><td>{offer.price}</td><td>{offer.oldPrice}</td><td>{isCheckoutConfigured(offer) ? 'Configured' : 'TODO — button disabled'}</td></tr>)}
    </tbody></table></div>
  </div>);
}
