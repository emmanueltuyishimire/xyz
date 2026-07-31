import React, { useState, useId } from 'react';

const CATEGORIES = ['All', 'Pharmacy', 'Restaurants', 'Retail', 'Entertainment', 'Travel', 'Transportation', 'National Parks', 'Utilities & Phone'];

const DISCOUNTS = [
  { name: 'Walgreens', category: 'Pharmacy', description: 'Senior Day first Tuesday of each month — 20% off most items.', age: '55+', howToClaim: 'Show ID at checkout.', notes: 'Check local store for participation.', verified: 'July 2026' },
  { name: 'CVS', category: 'Pharmacy', description: 'ExtraCare Plus members 65+ — 20% savings on eligible items.', age: '65+', howToClaim: 'Sign up in-store or at cvs.com.', notes: 'Requires joining their rewards program.', verified: 'July 2026' },
  { name: 'Rite Aid', category: 'Pharmacy', description: '10% off every Wednesday for seniors with Wellness+ rewards.', age: '65+', howToClaim: 'Show card at checkout.', notes: '', verified: 'July 2026' },
  { name: 'Publix', category: 'Pharmacy', description: 'Some locations offer senior discount Wednesdays.', age: '60+', howToClaim: 'Ask at customer service.', notes: 'Highly location-specific.', verified: 'July 2026' },
  { name: 'Denny\'s', category: 'Restaurants', description: '15% off total bill for AARP members.', age: '50+', howToClaim: 'Show AARP card.', notes: 'Cannot be combined with other offers.', verified: 'July 2026' },
  { name: 'McDonald\'s', category: 'Restaurants', description: 'Discounted coffee and drinks.', age: '55+', howToClaim: 'Ask at counter.', notes: 'Varies heavily by franchise.', verified: 'July 2026' },
  { name: 'Perkins', category: 'Restaurants', description: 'Special 55+ menu with discounted items.', age: '55+', howToClaim: 'Ask for the senior menu.', notes: '', verified: 'July 2026' },
  { name: 'Golden Corral', category: 'Restaurants', description: 'Senior discount available.', age: '60+', howToClaim: 'Ask at register.', notes: 'Amount varies by location.', verified: 'July 2026' },
  { name: 'Bob Evans', category: 'Restaurants', description: '10% off total check.', age: '60+', howToClaim: 'Show ID or ask.', notes: '', verified: 'July 2026' },
  { name: 'IHOP', category: 'Restaurants', description: 'Exclusive 55+ menu.', age: '55+', howToClaim: 'Ask for the 55+ menu.', notes: '', verified: 'July 2026' },
  { name: 'Outback Steakhouse', category: 'Restaurants', description: '10% off food and non-alcoholic drinks.', age: '50+', howToClaim: 'Show AARP card.', notes: '', verified: 'July 2026' },
  { name: 'Kohl\'s', category: 'Retail', description: '15% off Wednesdays.', age: '60+', howToClaim: 'Show ID at register.', notes: 'In-store only.', verified: 'July 2026' },
  { name: 'Michael\'s', category: 'Retail', description: '10% off entire purchase including sale items.', age: '55+', howToClaim: 'Register for Michaels Rewards online or show ID.', notes: '', verified: 'July 2026' },
  { name: 'Ross Dress for Less', category: 'Retail', description: '10% off on Tuesdays.', age: '55+', howToClaim: 'Show ID and ask for the Tuesday discount.', notes: 'Must sign up for "Every Tuesday Club" in store.', verified: 'July 2026' },
  { name: 'Goodwill', category: 'Retail', description: '10-25% off on specific senior days.', age: 'Varies', howToClaim: 'Ask at store.', notes: 'Varies entirely by local region.', verified: 'July 2026' },
  { name: 'Burlington Coat Factory', category: 'Retail', description: '8% off on Tuesdays.', age: '60+', howToClaim: 'Show ID.', notes: '', verified: 'July 2026' },
  { name: 'Best Western', category: 'Travel', description: '10% off Best Available Rate.', age: '55+ or AARP', howToClaim: 'Book online using AARP/Senior rate.', notes: '', verified: 'July 2026' },
  { name: 'Marriott', category: 'Travel', description: 'Up to 15% off for seniors.', age: '62+', howToClaim: 'Select senior rate when booking.', notes: 'Subject to availability.', verified: 'July 2026' },
  { name: 'Hilton', category: 'Travel', description: 'Up to 10% off.', age: '65+ or AARP', howToClaim: 'Book online with Senior/AARP rate.', notes: '', verified: 'July 2026' },
  { name: 'Hertz', category: 'Travel', description: 'Up to 25% off base rates.', age: '50+', howToClaim: 'Use AARP discount code when booking.', notes: '', verified: 'July 2026' },
  { name: 'Enterprise', category: 'Travel', description: '5-10% off.', age: '50+', howToClaim: 'Use AARP discount code.', notes: '', verified: 'July 2026' },
  { name: 'Amtrak', category: 'Transportation', description: '10% off most rail fares.', age: '65+', howToClaim: 'Select senior passenger type when booking.', notes: 'Not valid on all routes.', verified: 'July 2026' },
  { name: 'AMC Theatres', category: 'Entertainment', description: 'Discounted senior matinee and Tuesday tickets.', age: '60+', howToClaim: 'Ask at box office.', notes: 'Prices vary by location.', verified: 'July 2026' },
  { name: 'Regal Cinemas', category: 'Entertainment', description: 'Senior pricing available.', age: '60+', howToClaim: 'Select senior ticket.', notes: '', verified: 'July 2026' },
  { name: 'America the Beautiful', category: 'National Parks', description: '$80 lifetime pass or $20 annual pass.', age: '62+', howToClaim: 'Purchase at recreation.gov or at park entrance.', notes: 'Covers all federal recreation sites.', verified: 'July 2026' },
  { name: 'Lifeline Program', category: 'Utilities & Phone', description: '$9.25/month credit for internet or phone.', age: 'Income-based', howToClaim: 'Apply at lifelinesupport.org.', notes: 'For households <=135% FPL.', verified: 'July 2026' },
  { name: 'T-Mobile Essentials 55+', category: 'Utilities & Phone', description: 'Discounted unlimited mobile plans.', age: '55+', howToClaim: 'Visit T-Mobile store or website.', notes: '', verified: 'July 2026' }
];

export const SeniorDiscountFinder: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const idPrefix = useId();

  const filteredDiscounts = DISCOUNTS.filter(d => {
    const matchesCategory = activeCategory === 'All' || d.category === activeCategory;
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          d.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #DDE3EA', borderRadius: '0.5rem', padding: '1.5rem' }}>
      
      <div style={{ marginBottom: '1.5rem' }}>
        <label htmlFor={`${idPrefix}-search`} style={{ display: 'block', fontSize: '14px', color: '#4B5A6E', marginBottom: '0.25rem' }}>Search Discounts</label>
        <input
          id={`${idPrefix}-search`}
          type="text"
          placeholder="e.g., Walgreens, AARP, movies"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '100%', fontSize: '18px', padding: '0.75rem', border: '1px solid #DDE3EA', borderRadius: '0.25rem' }}
        />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '16px',
              borderRadius: '2rem',
              border: '1px solid',
              borderColor: activeCategory === cat ? '#0A3D3A' : '#cbd5e1',
              backgroundColor: activeCategory === cat ? '#0A3D3A' : '#f8fafc',
              color: activeCategory === cat ? '#ffffff' : '#0D2137',
              cursor: 'pointer',
              fontWeight: activeCategory === cat ? 700 : 400
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {activeCategory === 'Transportation' && (
        <div style={{ background: '#fff8f0', borderLeft: '4px solid #E8761A', padding: '1rem', marginBottom: '1.5rem', borderRadius: '0 0.25rem 0.25rem 0' }}>
          <p style={{ margin: 0, fontSize: '18px', color: '#0D2137', fontWeight: 700 }}>Local Transit Discounts</p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '16px', color: '#0D2137' }}>
            Almost all public transit authorities that receive federal funds offer 50% off fares for seniors 65+. You must contact your local city or county transit authority directly to apply for a reduced-fare card.
          </p>
        </div>
      )}

      <div style={{ display: 'grid', gap: '1rem' }}>
        {filteredDiscounts.length === 0 ? (
          <p style={{ fontSize: '18px', color: '#4B5A6E' }}>No discounts found matching your criteria.</p>
        ) : (
          filteredDiscounts.map((discount, i) => (
            <div key={i} style={{ background: '#F6F8FA', border: '1px solid #DDE3EA', borderRadius: '0.5rem', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', color: '#0D2137', margin: 0, fontWeight: 700 }}>{discount.name}</h3>
                <span style={{ background: '#0A3D3A', color: '#fff', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '14px', fontWeight: 700 }}>
                  Age: {discount.age}
                </span>
              </div>
              
              <p style={{ fontSize: '18px', color: '#0D2137', margin: '0 0 1rem 0', fontWeight: 700 }}>
                {discount.description}
              </p>
              
              <div style={{ background: '#ffffff', border: '1px solid #DDE3EA', borderRadius: '0.25rem', padding: '1rem' }}>
                <p style={{ margin: '0 0 0.25rem 0', fontSize: '14px', color: '#4B5A6E', fontWeight: 700, textTransform: 'uppercase' }}>How to claim it</p>
                <p style={{ margin: 0, fontSize: '18px', color: '#1A7A4E', fontWeight: 700 }}>{discount.howToClaim}</p>
                
                {discount.notes && (
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '14px', color: '#4B5A6E' }}>
                    <em>Note: {discount.notes}</em>
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: '2rem', fontSize: '14px', color: '#4B5A6E', textAlign: 'center' }}>
        <p>Policies change frequently. Always verify with the business directly. 'Just ask' is your best tool.</p>
      </div>
    </div>
  );
};
