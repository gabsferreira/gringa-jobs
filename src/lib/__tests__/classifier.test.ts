import { classifyEligibility, VERDICT_LABELS, VERDICT_ORDER } from '../classifier';

describe('classifyEligibility', () => {
  describe('positive signals', () => {
    it('should detect Brazil mention and return "yes"', () => {
      const result = classifyEligibility({
        description: 'Remote position open to candidates in Brazil',
      });
      expect(result.verdict).toBe('yes');
      expect(result.score).toBe(3);
      expect(result.reasons).toContain('mentions Brazil');
    });

    it('should detect Brasil (Portuguese) mention', () => {
      const result = classifyEligibility({
        description: 'Vaga remota para Brasil',
      });
      expect(result.verdict).toBe('yes');
      expect(result.reasons).toContain('mentions Brazil');
    });

    it('should detect LATAM mention', () => {
      const result = classifyEligibility({
        description: 'We are hiring engineers from LATAM',
      });
      expect(result.verdict).toBe('yes');
      expect(result.score).toBe(3);
      expect(result.reasons).toContain('mentions LATAM');
    });

    it('should detect Latin America mention', () => {
      const result = classifyEligibility({
        description: 'Open to candidates in Latin America',
      });
      expect(result.verdict).toBe('yes');
      expect(result.reasons).toContain('mentions LATAM');
    });

    it('should detect worldwide/global remote', () => {
      const result = classifyEligibility({
        description: 'Work from anywhere in the world',
      });
      expect(result.verdict).toBe('yes');
      expect(result.reasons).toContain('global remote');
    });

    it('should detect Deel contractor', () => {
      const result = classifyEligibility({
        description: 'We hire via Deel for international contractors',
      });
      expect(result.verdict).toBe('likely');
      expect(result.score).toBe(2);
      expect(result.reasons).toContain('hires via EOR/contractor');
    });

    it('should detect UTC-3 timezone', () => {
      const result = classifyEligibility({
        description: 'Prefer candidates in UTC-3 timezone',
      });
      expect(result.verdict).toBe('likely');
      expect(result.reasons).toContain('compatible timezone (UTC-3)');
    });

    it('should detect Americas region', () => {
      const result = classifyEligibility({
        description: 'Remote position for the Americas',
      });
      expect(result.verdict).toBe('likely');
      expect(result.score).toBe(2);
      expect(result.reasons).toContain('mentions Americas');
    });

    it('should accumulate multiple positive signals', () => {
      const result = classifyEligibility({
        description: 'Remote job in Brazil, we hire via Deel, LATAM preferred',
      });
      expect(result.verdict).toBe('yes');
      expect(result.score).toBe(8); // 3 (Brazil) + 2 (Deel) + 3 (LATAM)
      expect(result.reasons).toHaveLength(3);
    });
  });

  describe('negative signals', () => {
    it('should detect US only restriction', () => {
      const result = classifyEligibility({
        description: 'This position is US only',
      });
      expect(result.verdict).toBe('unlikely');
      expect(result.score).toBe(-4);
      expect(result.reasons).toContain('US only');
    });

    it('should detect work authorization requirement', () => {
      const result = classifyEligibility({
        description: 'Must be authorized to work in the United States',
      });
      expect(result.verdict).toBe('unlikely');
      expect(result.reasons).toContain('requires US work authorization');
    });

    it('should detect W2 contract', () => {
      const result = classifyEligibility({
        description: 'Full-time W2 position with benefits',
      });
      expect(result.verdict).toBe('unlikely');
      expect(result.score).toBe(-3);
      expect(result.reasons).toContain('W2 contract (US)');
    });

    it('should detect Europe only restriction', () => {
      const result = classifyEligibility({
        description: 'EU-only position, must be based in Europe',
      });
      expect(result.verdict).toBe('unlikely');
      expect(result.reasons).toContain('Europe only');
    });

    it('should detect residence requirements', () => {
      const result = classifyEligibility({
        description: 'Must be located in Canada',
      });
      expect(result.verdict).toBe('unlikely');
      expect(result.reasons).toContain('requires residence outside Brazil');
    });

    it('should accumulate multiple negative signals', () => {
      const result = classifyEligibility({
        description: 'US only, W2 employment, must be authorized to work in the US',
      });
      expect(result.verdict).toBe('unlikely');
      expect(result.score).toBe(-11); // -4 (US only) + -3 (W2) + -4 (authorization)
      expect(result.reasons.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('mixed signals', () => {
    it('should balance positive and negative signals', () => {
      const result = classifyEligibility({
        description: 'Remote position for LATAM, but EST business hours required',
      });
      // LATAM (+3) + EST hours (-1) = 2
      expect(result.score).toBe(2);
      expect(result.verdict).toBe('likely');
    });

    it('should return unclear when signals cancel out', () => {
      const result = classifyEligibility({
        description: 'Remote job in South America region, no visa sponsorship',
      });
      // South America (+2) + no sponsorship (-1) = 1
      expect(result.score).toBe(1);
      expect(result.verdict).toBe('unclear');
    });

    it('negative signals should outweigh weak positives', () => {
      const result = classifyEligibility({
        description: 'Americas timezone, but US only',
      });
      // Americas (+2) + US only (-4) = -2
      expect(result.verdict).toBe('unlikely');
    });
  });

  describe('edge cases', () => {
    it('should handle empty job data', () => {
      const result = classifyEligibility({});
      expect(result.verdict).toBe('unclear');
      expect(result.score).toBe(0);
      expect(result.reasons).toHaveLength(0);
    });

    it('should handle null location', () => {
      const result = classifyEligibility({
        title: 'Software Engineer',
        location: null,
        description: 'Remote position',
      });
      expect(result.verdict).toBe('unclear');
    });

    it('should check title field', () => {
      const result = classifyEligibility({
        title: 'Senior Engineer - Brazil',
        description: 'Join our team',
      });
      expect(result.reasons).toContain('mentions Brazil');
    });

    it('should check location field', () => {
      const result = classifyEligibility({
        title: 'Software Engineer',
        location: 'Remote - LATAM',
      });
      expect(result.reasons).toContain('mentions LATAM');
    });

    it('should check extensions array', () => {
      const result = classifyEligibility({
        title: 'Engineer',
        extensions: ['Full-time', 'Worldwide'],
      });
      expect(result.reasons).toContain('global remote');
    });

    it('should be case insensitive', () => {
      const result = classifyEligibility({
        description: 'BRAZIL, LATAM, WORLDWIDE',
      });
      expect(result.verdict).toBe('yes');
      expect(result.reasons).toContain('mentions Brazil');
      expect(result.reasons).toContain('mentions LATAM');
    });
  });

  describe('verdict thresholds', () => {
    it('should return "yes" for score >= 3', () => {
      const result = classifyEligibility({
        description: 'Brazil based position', // +3
      });
      expect(result.verdict).toBe('yes');
    });

    it('should return "likely" for score 2', () => {
      const result = classifyEligibility({
        description: 'Americas region', // +2
      });
      expect(result.verdict).toBe('likely');
    });

    it('should return "unclear" for score 0-1', () => {
      const result = classifyEligibility({
        description: 'Remote software engineer position',
      });
      expect(result.verdict).toBe('unclear');
    });

    it('should return "unlikely" for negative scores', () => {
      const result = classifyEligibility({
        description: 'US only position',
      });
      expect(result.verdict).toBe('unlikely');
    });
  });
});

describe('VERDICT_LABELS', () => {
  it('should have labels for all verdict types', () => {
    expect(VERDICT_LABELS.yes).toBe('Brazilian can apply');
    expect(VERDICT_LABELS.likely).toBe('Likely eligible');
    expect(VERDICT_LABELS.unclear).toBe('Unclear');
    expect(VERDICT_LABELS.unlikely).toBe('Unlikely eligible');
  });
});

describe('VERDICT_ORDER', () => {
  it('should order verdicts correctly for sorting', () => {
    expect(VERDICT_ORDER.yes).toBeLessThan(VERDICT_ORDER.likely);
    expect(VERDICT_ORDER.likely).toBeLessThan(VERDICT_ORDER.unclear);
    expect(VERDICT_ORDER.unclear).toBeLessThan(VERDICT_ORDER.unlikely);
  });
});
