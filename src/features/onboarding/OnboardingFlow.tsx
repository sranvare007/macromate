// First-launch flow (PRD §5.1): splash → weight → height → goal →
// calculating → summary. Single component with internal step state,
// matching the design prototype (onboarding.jsx).

import * as React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AccentButton } from '../../components/AccentButton';
import { Icon } from '../../components/Icon';
import { Ring } from '../../components/Ring';
import { fetchCalorieRecommend } from '../../api/calories';
import { computeTargets } from '../../lib/macros';
import { formatFtIn, kgToLb } from '../../lib/units';
import { FONTS, useTheme } from '../../theme';
import type { MacroSet, UserProfile } from '../../types';
import { CalculatingBody } from './CalculatingBody';
import { GoalCardList } from '../goals/GoalCardList';

// App icon (flame logo) so onboarding matches the launcher/store identity.
function Logo({ size = 92 }: { size?: number }) {
  const T = useTheme();
  return (
    <View
      style={{
        borderRadius: size * 0.3,
        shadowColor: T.accent.mid,
        shadowOpacity: 0.6,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 14 },
        elevation: 10,
      }}
    >
      <Image
        source={require('../../../assets/icon.png')}
        accessibilityRole="image"
        accessibilityLabel="MacroMate logo"
        style={{ width: size, height: size, borderRadius: size * 0.3 }}
      />
    </View>
  );
}

function StepHeader({ onBack, step, total }: { onBack: () => void; step: number; total: number }) {
  const T = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.stepHeader, { paddingTop: insets.top + 8 }]}>
      <Pressable
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        style={[styles.backBtn, { borderColor: T.c.hair, backgroundColor: T.c.card }]}
      >
        <Icon name="chevL" size={19} color={T.c.sub} />
      </Pressable>
      <View style={styles.progress} accessible accessibilityLabel={`Step ${step} of ${total}`}>
        {Array.from({ length: total }, (_, i) => (
          <View
            key={i}
            style={[styles.progressSeg, { backgroundColor: i < step ? T.accent.mid : T.c.sunken }]}
          />
        ))}
      </View>
    </View>
  );
}

function UnitToggle({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  const T = useTheme();
  return (
    <View style={[styles.unitToggle, { backgroundColor: T.c.sunken }]}>
      {options.map((u) => (
        <Pressable
          key={u}
          onPress={() => onChange(u)}
          accessibilityRole="button"
          accessibilityLabel={`Show in ${u}`}
          accessibilityState={{ selected: value === u }}
          style={[styles.unitBtn, value === u && { backgroundColor: T.c.card }]}
        >
          <Text style={[styles.unitText, { color: value === u ? T.c.text : T.c.faint }]}>{u}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function Stepper({ value, unitLabel, onMinus, onPlus }: { value: string; unitLabel: string; onMinus: () => void; onPlus: () => void }) {
  const T = useTheme();
  return (
    <View style={styles.stepperRow}>
      <Pressable
        onPress={onMinus}
        accessibilityRole="button"
        accessibilityLabel="Decrease"
        style={[styles.stepperBtn, { borderColor: T.c.hair, backgroundColor: T.c.card }]}
      >
        <Text style={[styles.stepperSign, { color: T.c.text }]}>−</Text>
      </Pressable>
      <View style={styles.stepperValueWrap}>
        <Text style={[styles.stepperValue, { color: T.c.text }]}>
          {value}
          {unitLabel ? <Text style={[styles.stepperUnit, { color: T.c.faint }]}> {unitLabel}</Text> : null}
        </Text>
      </View>
      <Pressable
        onPress={onPlus}
        accessibilityRole="button"
        accessibilityLabel="Increase"
        style={[styles.stepperBtn, { borderColor: T.c.hair, backgroundColor: T.c.card }]}
      >
        <Text style={[styles.stepperSign, { color: T.c.text }]}>+</Text>
      </Pressable>
    </View>
  );
}

interface OnboardingFlowProps {
  initialProfile: UserProfile;
  onFinish: (profile: UserProfile) => void;
  onClose?: () => void;
}

export function OnboardingFlow({ initialProfile, onFinish, onClose }: OnboardingFlowProps) {
  const T = useTheme();
  const insets = useSafeAreaInsets();
  const [step, setStep] = React.useState(0);
  const [draft, setDraft] = React.useState<UserProfile>(initialProfile);
  const [wUnit, setWUnit] = React.useState('kg');
  const [hUnit, setHUnit] = React.useState('cm');
  const [recommendedTargets, setRecommendedTargets] = React.useState<MacroSet | null>(null);
  const targets = recommendedTargets ?? computeTargets(draft);

  // Fetch targets from the API while the calculating animation plays
  React.useEffect(() => {
    if (step !== 4) return;
    let cancelled = false;
    const { weightKg, heightCm, goalKey } = draft;

    const run = async () => {
      const minDelay = new Promise<void>((resolve) => setTimeout(resolve, 2200));
      const recommendPromise = fetchCalorieRecommend({ weightKg, heightCm, goalKey }).catch(() =>
        computeTargets({ weightKg, heightCm, goalKey, age: draft.age, sex: draft.sex }),
      );
      const [, result] = await Promise.all([minDelay, recommendPromise]);
      if (!cancelled) {
        setRecommendedTargets(result);
        setStep(5);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [step, draft.weightKg, draft.heightCm, draft.goalKey, draft.age, draft.sex]);

  const back = () => {
    if (step === 0) onClose?.();
    else setStep((s) => Math.max(0, s - 1));
  };

  const footer = (children: React.ReactNode) => (
    <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 14) + 16 }]}>{children}</View>
  );

  // ---- 0: splash ----
  if (step === 0) {
    return (
      <View style={[styles.root, { backgroundColor: T.c.bg }]}>
        <View style={[styles.decorRing, styles.decorTop, { borderColor: T.accent.mid }]} />
        <View style={[styles.decorRing, styles.decorBottom, { borderColor: T.macros.protein }]} />
        <View style={styles.splashCenter}>
          <Logo />
          <Text style={[styles.appName, { color: T.c.text }]}>MacroMate</Text>
          <Text style={[styles.tagline, { color: T.c.sub }]}>
            Just say what you ate. AI logs your calories and macros — and keeps you on track.
          </Text>
        </View>
        {footer(
          <>
            <AccentButton icon="arrowUp" onPress={() => setStep(1)}>
              Get started
            </AccentButton>
            <Pressable
              onPress={() => onFinish(draft)}
              accessibilityRole="button"
              accessibilityLabel="I already have an account"
              style={styles.secondaryBtn}
            >
              <Text style={[styles.secondaryText, { color: T.c.sub }]}>I already have an account</Text>
            </Pressable>
          </>,
        )}
      </View>
    );
  }

  // ---- 1: weight ----
  if (step === 1) {
    const display = wUnit === 'kg' ? `${Math.round(draft.weightKg)}` : `${Math.round(kgToLb(draft.weightKg))}`;
    const adj = (d: number) =>
      setDraft((p) => ({ ...p, weightKg: Math.min(160, Math.max(40, p.weightKg + d)) }));
    return (
      <View style={[styles.root, { backgroundColor: T.c.bg }]}>
        <StepHeader onBack={back} step={1} total={3} />
        <View style={styles.stepBody}>
          <Text style={[styles.question, { color: T.c.text }]}>What's your weight?</Text>
          <Text style={[styles.questionSub, { color: T.c.faint }]}>
            We use this to calculate your calorie needs.
          </Text>
          <View style={styles.unitToggleWrap}>
            <UnitToggle options={['kg', 'lb']} value={wUnit} onChange={setWUnit} />
          </View>
          <Stepper value={display} unitLabel={wUnit} onMinus={() => adj(-1)} onPlus={() => adj(1)} />
        </View>
        {footer(<AccentButton onPress={() => setStep(2)}>Continue</AccentButton>)}
      </View>
    );
  }

  // ---- 2: height ----
  if (step === 2) {
    const display = hUnit === 'cm' ? `${Math.round(draft.heightCm)}` : formatFtIn(draft.heightCm);
    const adj = (d: number) =>
      setDraft((p) => ({ ...p, heightCm: Math.min(210, Math.max(140, p.heightCm + d)) }));
    return (
      <View style={[styles.root, { backgroundColor: T.c.bg }]}>
        <StepHeader onBack={back} step={2} total={3} />
        <View style={styles.stepBody}>
          <Text style={[styles.question, { color: T.c.text }]}>How tall are you?</Text>
          <Text style={[styles.questionSub, { color: T.c.faint }]}>Used in the Mifflin-St Jeor formula.</Text>
          <View style={styles.unitToggleWrap}>
            <UnitToggle options={['cm', 'ft']} value={hUnit} onChange={setHUnit} />
          </View>
          <Stepper
            value={display}
            unitLabel={hUnit === 'cm' ? 'cm' : ''}
            onMinus={() => adj(-1)}
            onPlus={() => adj(1)}
          />
        </View>
        {footer(<AccentButton onPress={() => setStep(3)}>Continue</AccentButton>)}
      </View>
    );
  }

  // ---- 3: goal ----
  if (step === 3) {
    return (
      <View style={[styles.root, { backgroundColor: T.c.bg }]}>
        <StepHeader onBack={back} step={3} total={3} />
        <View style={styles.goalIntro}>
          <Text style={[styles.question, { color: T.c.text }]}>What's your goal?</Text>
          <Text style={[styles.questionSub, { color: T.c.faint }]}>
            This sets your calorie and protein direction.
          </Text>
        </View>
        <ScrollView style={styles.goalScroll} contentContainerStyle={styles.goalScrollContent}>
          <GoalCardList
            selected={draft.goalKey}
            onSelect={(goalKey) => setDraft((p) => ({ ...p, goalKey }))}
            showMacroTags={false}
          />
        </ScrollView>
        {footer(
          <AccentButton icon="sparkle" onPress={() => setStep(4)}>
            Calculate my targets
          </AccentButton>,
        )}
      </View>
    );
  }

  // ---- 4: calculating ----
  if (step === 4) {
    return (
      <View style={[styles.root, { backgroundColor: T.c.bg }]}>
        <CalculatingBody
          lines={['Computing your BMR', 'Applying activity level', 'Setting macro split', 'Finalising targets']}
        />
      </View>
    );
  }

  // ---- 5: summary ----
  return (
    <View style={[styles.root, { backgroundColor: T.c.bg }]}>
      <View style={[styles.summaryHeader, { paddingTop: insets.top + 16 }]}>
        <View style={[styles.allSet, { backgroundColor: `${T.status.ok}22` }]}>
          <Icon name="check" size={16} color={T.status.ok} stroke={3} />
          <Text style={[styles.allSetText, { color: T.status.ok }]}>You're all set</Text>
        </View>
        <Text style={[styles.question, { color: T.c.text }]}>Your daily targets</Text>
        <Text style={[styles.questionSub, { color: T.c.faint }]}>Based on your body and goal</Text>
      </View>
      <View style={styles.summaryCenter}>
        <Ring
          size={216}
          stroke={20}
          value={1}
          max={1}
          color={T.accent.hi}
          track={T.c.sunken}
          glow
          accessibilityLabel={`Daily target: ${targets.kcal} calories`}
        >
          <Text style={[styles.summaryKcal, { color: T.c.text }]}>{targets.kcal}</Text>
          <Text style={[styles.summaryKcalUnit, { color: T.c.faint }]}>KCAL / DAY</Text>
        </Ring>
        <View style={styles.summaryMacros}>
          {(
            [
              ['Protein', targets.protein, T.macros.protein],
              ['Carbs', targets.carbs, T.macros.carbs],
              ['Fat', targets.fat, T.macros.fat],
              ['Fibre', targets.fibre, T.macros.fibre],
            ] as const
          ).map(([label, value, color]) => (
            <View key={label} style={[styles.summaryMacro, { backgroundColor: T.c.card, borderColor: T.c.hair }]}>
              <Text style={[styles.summaryMacroValue, { color }]}>
                {value}
                <Text style={[styles.summaryMacroUnit, { color: T.c.faint }]}>g</Text>
              </Text>
              <Text style={[styles.summaryMacroLabel, { color: T.c.faint }]}>{label.toUpperCase()}</Text>
            </View>
          ))}
        </View>
      </View>
      {footer(
        <AccentButton icon="home" onPress={() => onFinish({ ...draft, streak: 0, targets })}>
          Start tracking
        </AccentButton>,
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, overflow: 'hidden' },
  decorRing: { position: 'absolute', borderRadius: 999, opacity: 0.1 },
  decorTop: { top: -120, right: -120, width: 340, height: 340, borderWidth: 40 },
  decorBottom: { bottom: -90, left: -90, width: 260, height: 260, borderWidth: 30 },
  splashCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 22 },
  appName: { fontSize: 38, fontFamily: FONTS.black, letterSpacing: -1 },
  tagline: { fontSize: 16.5, fontFamily: FONTS.bold, textAlign: 'center', lineHeight: 24, maxWidth: 280, marginTop: -10 },
  footer: { paddingHorizontal: 24, paddingTop: 12, gap: 12 },
  secondaryBtn: { alignItems: 'center', padding: 8, minHeight: 44, justifyContent: 'center' },
  secondaryText: { fontSize: 15, fontFamily: FONTS.extrabold },
  stepHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingBottom: 8 },
  backBtn: { width: 44, height: 44, borderRadius: 99, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  progress: { flex: 1, flexDirection: 'row', gap: 6 },
  progressSeg: { flex: 1, height: 6, borderRadius: 99 },
  stepBody: { flex: 1, paddingHorizontal: 24, paddingTop: 12 },
  question: { fontSize: 28, fontFamily: FONTS.black },
  questionSub: { fontSize: 14.5, fontFamily: FONTS.bold, marginTop: 6 },
  unitToggleWrap: { alignItems: 'center', marginTop: 30, marginBottom: 26 },
  unitToggle: { flexDirection: 'row', gap: 3, padding: 3, borderRadius: 11 },
  unitBtn: { borderRadius: 8, paddingVertical: 7, paddingHorizontal: 16 },
  unitText: { fontSize: 13.5, fontFamily: FONTS.extrabold },
  stepperRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20 },
  stepperBtn: { width: 52, height: 52, borderRadius: 99, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  stepperSign: { fontSize: 28, fontFamily: FONTS.extrabold, lineHeight: 32 },
  stepperValueWrap: { minWidth: 150, alignItems: 'center' },
  stepperValue: { fontSize: 60, fontFamily: FONTS.black, lineHeight: 66, fontVariant: ['tabular-nums'] },
  stepperUnit: { fontSize: 19, fontFamily: FONTS.extrabold },
  goalIntro: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 4 },
  goalScroll: { flex: 1 },
  goalScrollContent: { paddingHorizontal: 18, paddingTop: 14 },
  summaryHeader: { alignItems: 'center', paddingHorizontal: 24 },
  allSet: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 99,
    marginBottom: 14,
  },
  allSetText: { fontSize: 13, fontFamily: FONTS.extrabold },
  summaryCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, gap: 24 },
  summaryKcal: { fontSize: 50, fontFamily: FONTS.black, lineHeight: 56, fontVariant: ['tabular-nums'] },
  summaryKcalUnit: { fontSize: 14, fontFamily: FONTS.extrabold, letterSpacing: 1 },
  summaryMacros: { flexDirection: 'row', gap: 9, width: '100%' },
  summaryMacro: { flex: 1, borderWidth: 1, borderRadius: 15, paddingVertical: 12, paddingHorizontal: 6, alignItems: 'center' },
  summaryMacroValue: { fontSize: 19, fontFamily: FONTS.black, fontVariant: ['tabular-nums'] },
  summaryMacroUnit: { fontSize: 11, fontFamily: FONTS.black },
  summaryMacroLabel: { fontSize: 10.5, fontFamily: FONTS.extrabold, letterSpacing: 0.4, marginTop: 2 },
});
