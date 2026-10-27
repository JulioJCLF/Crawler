import { describe, it, expect } from "vitest";
import {
  isAccessory,
  isReplicaGun,
  isTrueSpringSniper,
  isAegReplica,
  isShotgun,
  isSpringShotgun,
  isAirsoftMotor,
  isGearSet,
  isPrecisionBarrel,
  isTracerOrSilencer,
  isElectronicTrigger,
  isHpaEquipment,
  isHandguard,
  isHolster,
  isMagazine,
  isSpeedLoader,
} from "./categoryUtils";

describe("categoryUtils - Regras de Categorização Refinada", () => {
  describe("M4 Punisher Sniper e réplicas com 'sniper' sem 'spring'", () => {
    it("deve classificar 'POSEIDON AEG M4 PUNISHER SNIPER' como AEG e não Sniper", () => {
      const product = {
        name: "POSEIDON AEG M4 PUNISHER SNIPER WITH AETHER AIRSOFT RIFLE BLACK",
        category: "replicas",
      };

      expect(isTrueSpringSniper(product)).toBe(false);
      expect(isAegReplica(product)).toBe(true);
      expect(isShotgun(product)).toBe(false);
    });

    it("deve classificar 'M4 Punisher Sniper' sem a palavra 'aeg' ou 'spring' como AEG", () => {
      const product = {
        name: "M4 PUNISHER SNIPER AIRSOFT RIFLE BLACK",
        category: "replicas",
      };

      expect(isTrueSpringSniper(product)).toBe(false);
      expect(isAegReplica(product)).toBe(true);
      expect(isShotgun(product)).toBe(false);
    });

    it("deve reclassificar SVD / PSG-1 elétricas que têm 'sniper' para a aba AEG", () => {
      const svd = {
        name: "CYMA AEG SNIPER SVD DRAGUNOV AIRSOFT RIFLE BLACK",
        category: "replicas",
      };
      const psg1 = {
        name: "TOKYO MARUI AEG SNIPER H&K PSG-1 AIRSOFT RIFLE BLACK",
        category: "replicas",
      };

      expect(isTrueSpringSniper(svd)).toBe(false);
      expect(isAegReplica(svd)).toBe(true);
      expect(isTrueSpringSniper(psg1)).toBe(false);
      expect(isAegReplica(psg1)).toBe(true);
    });
  });

  describe("Shotguns Unificadas (Spring, GBB, CO2, Elétrica)", () => {
    it("deve agregar shotguns Spring (S&T M870, A&K M870)", () => {
      const sAndT = {
        name: "S&T ARMAMENT SPRING BOLT ACTION M870 SHORT AIRSOFT RIFLE SILVER",
        category: "pecas-internas",
      };
      const aAndK = {
        name: "A&K SPRING BOLT ACTION M870 SXR TRAINING SHOTGUN LONG VERSION AIRSOFT RIFLE BLACK",
        category: "pecas-internas",
      };

      expect(isShotgun(sAndT)).toBe(true);
      expect(isTrueSpringSniper(sAndT)).toBe(false);
      expect(isShotgun(aAndK)).toBe(true);
      expect(isTrueSpringSniper(aAndK)).toBe(false);
    });

    it("deve agregar shotguns GBB e CO2 (Tokyo Marui Breacher, CAM870)", () => {
      const tmBreacher = {
        name: "TOKYO MARUI GBB M870 BREACHER SHOTGUN BLOWBACK AIRSOFT RIFLE BLACK",
        category: "replicas",
      };
      const cam870 = {
        name: "SALIENT ARMS EMG APS CO2 CAM870 MKIII BULLDOG PUMP ACTION AIRSOFT RIFLE SHOTGUN BLACK",
        category: "replicas",
      };

      expect(isShotgun(tmBreacher)).toBe(true);
      expect(isShotgun(cam870)).toBe(true);
      expect(isTrueSpringSniper(tmBreacher)).toBe(false);
      expect(isTrueSpringSniper(cam870)).toBe(false);
    });

    it("deve agregar shotguns elétricas (AA-12, SGR-12)", () => {
      const aa12 = {
        name: "TOKYO MARUI AEG AA-12 SHOTGUN FULL-AUTO WITH DRUM MAG AIRSOFT RIFLE BLACK",
        category: "replicas",
      };
      const sgr12 = {
        name: "CYMA AEG SGR-12 PLATINUM SERIES TRI-SHOT SHOGTGUN AIRSOFT RIFLE BLACK",
        category: "replicas",
      };

      expect(isShotgun(aa12)).toBe(true);
      expect(isShotgun(sgr12)).toBe(true);
      expect(isAegReplica(aa12)).toBe(false); // Direcionado para Shotguns
    });

    it("não deve considerar acessórios (cartuchos, trilhos) como réplicas de shotgun", () => {
      const shell = {
        name: "TOKYO MARUI SHELL SHOTGUN 30R M3 / M870 GREEN",
        category: "magazines",
      };
      const rail = {
        name: "CYMA SHOTGUN TOP RAIL M870",
        category: "pecas-externas",
      };

      expect(isShotgun(shell)).toBe(false);
      expect(isShotgun(rail)).toBe(false);
    });
  });

  describe("Motores Elétricos de Airsoft (#motores)", () => {
    it("deve identificar motores elétricos legítimos", () => {
      expect(isAirsoftMotor({ name: "ACTION ARMY MOTOR 35000RPM INFINITY AAC SHORT TYPE" })).toBe(true);
      expect(isAirsoftMotor({ name: "GATE MOTOR 46000RPM G5 BRUSHLESS SHORT TYPE" })).toBe(true);
      expect(isAirsoftMotor({ name: "KRYTAC MOTOR 30000RPM HIGH TORQUE LONG TYPE" })).toBe(true);
      expect(isAirsoftMotor({ name: "CHAOLI MOTOR 60000RPM BRUSHLESS CBL480 LONG TYPE SILVER" })).toBe(true);
    });

    it("não deve considerar motor grips, tampas ou parafusos como motores", () => {
      expect(isAirsoftMotor({ name: "CYMA GRIP WITH MOTOR COVER FOR M4" })).toBe(false);
      expect(isAirsoftMotor({ name: "G&G PISTOL GRIP V-MOTOR PURPLE" })).toBe(false);
      expect(isAirsoftMotor({ name: "APS MOTOR MOUNT FOR AK SERIES AIRSOFT AEG" })).toBe(false);
      expect(isAirsoftMotor({ name: "ACTION ARMY MOTOR GEAR PINION" })).toBe(false);
      // 'motor gear' da Solink é engrenagem, não motor
      expect(isAirsoftMotor({ name: "SOLINK MOTOR GEAR HELICAL 12:1" })).toBe(false);
      expect(isAirsoftMotor({ name: "SOLINK MOTOR GEAR HIGH SPEED SET NOT HOLLOW 13:1" })).toBe(false);
    });
  });

  describe("Engrenagens e Gear Sets (#engrenagens)", () => {
    it("deve classificar 'motor gear' da Solink como engrenagem", () => {
      expect(isGearSet({ name: "SOLINK MOTOR GEAR HELICAL 12:1", category: "pecas-internas" })).toBe(true);
      expect(isGearSet({ name: "SOLINK MOTOR GEAR HIGH SPEED SET NOT HOLLOW 13:1", category: "pecas-internas" })).toBe(true);
      expect(isGearSet({ name: "SOLINK MOTOR GEAR BEVEL MOTOR TOOTH", category: "pecas-internas" })).toBe(true);
    });

    it("deve classificar conjuntos de engrenagens de gearbox tradicionais", () => {
      expect(isGearSet({ name: "ARES HIGH TORQUE GEAR SET 32:1", category: "pecas-internas" })).toBe(true);
      expect(isGearSet({ name: "BOLT GEAR SET MIM FOR AEG (RATIO 22:1)", category: "pecas-internas" })).toBe(true);
      expect(isGearSet({ name: "G&G GEAR STEEL SET 12:1", category: "pecas-internas" })).toBe(true);
      expect(isGearSet({ name: "ACTION ARMY MOTOR GEAR PINION", category: "pecas-internas" })).toBe(true);
    });

    it("não deve classificar carcaças de gearbox completas nem vestuário como engrenagens", () => {
      expect(isGearSet({ name: "CYMA GEARBOX COMPLETE V3 WITH MOTOR FOR AK SERIES CM103", category: "pecas-internas" })).toBe(false);
      expect(isGearSet({ name: "BLACK OWL GEAR FLASHLIGHT PISTOL SSL 0702 WITH RED LASER BLACK", category: "miras" })).toBe(false);
      expect(isGearSet({ name: "T238 GEAR PULLER FOR REPAIR MOTORS AEG", category: "replicas" })).toBe(false);
    });
  });

  describe("Canos de Precisão, Tracers e MOSFETs", () => {
    it("deve classificar canos de precisão internos", () => {
      expect(isPrecisionBarrel({ name: "ACTION ARMY INNER BARREL PRECISION MASAMUNE 6.01/430MM FOR VSR-10" })).toBe(true);
      expect(isPrecisionBarrel({ name: "PROMETHEUS EG INNER BARREL 6.03MM / 363MM FOR M4" })).toBe(true);
      expect(isPrecisionBarrel({ name: "MAPLE LEAF OUTER BARREL EXTENSION" })).toBe(false);
    });

    it("deve classificar unidades tracer e silenciadores", () => {
      expect(isTracerOrSilencer({ name: "ACETECH TRACER UNIT LIGHTER BT WITH CHRONO BLACK" })).toBe(true);
      expect(isTracerOrSilencer({ name: "SILENCER QUICK DETACH FOR M4 BLACK" })).toBe(true);
      expect(isTracerOrSilencer({ name: "ACETECH TRACER AT2000 FOR GREEN BBS ONLY" })).toBe(true);
      expect(isTracerOrSilencer({ name: "ACETECH TRACER AT2000 WITH S0006-CB CK043 AND BB KING BBS 0.25GR" })).toBe(true);
      expect(isTracerOrSilencer({ name: "TRACER BBs 0.25G GREEN" })).toBe(false);
      expect(isTracerOrSilencer({ name: "ACETECH BBS RED TRACER 0.25G / 2700R BOTTLE" })).toBe(false);
    });

    it("deve classificar speed loaders e carregadores rápidos", () => {
      expect(isSpeedLoader({ name: "CYMA SPEED LOADER 100R BLACK" })).toBe(true);
      expect(isSpeedLoader({ name: "PTS ODIN INNOVATIONS SPEED LOADER 1600R M12 BLACK" })).toBe(true);
      expect(isSpeedLoader({ name: "PTS ODIN M12 SIDEWINDER REBUILD REAPAIR KIT" })).toBe(true);
      expect(isSpeedLoader({ name: "SRC BB LOADING MR. ROLL UP" })).toBe(true);
      expect(isSpeedLoader({ name: "G&G BBS 0.25G / 5600R POTE" })).toBe(false);
    });

    it("deve classificar MOSFETs e gatilhos eletrônicos avulsos", () => {
      expect(isElectronicTrigger({ name: "GATE TITAN V2 EXPERT EDITION DROP-IN MOSFET" })).toBe(true);
      expect(isElectronicTrigger({ name: "PERUN V2 OPTICAL ELECTRONIC TRIGGER UNIT" })).toBe(true);
      expect(isElectronicTrigger({ name: "G&G AEG M4 WITH ETU AND MOSFET AIRSOFT RIFLE" })).toBe(false);
    });
  });

  describe("Sistemas HPA e Ar Comprimido (#hpa)", () => {
    it("deve classificar compressores PCP", () => {
      expect(isHpaEquipment({ name: "ARMADILLO PCP COMPRESSOR 1600W 4500PSI 220V WITH AUTO STOP BLACK" })).toBe(true);
      expect(isHpaEquipment({ name: "ARMADILLO PCP COMPRESSOR 250W 18V 4350PSI BATTERY 18V GREEN" })).toBe(true);
    });

    it("deve classificar reguladoras e tanques HPA / PCP", () => {
      expect(isHpaEquipment({ name: "ARMADILLO HPA REGULATOR HPA MAX 180PSI WITH REMOTE" })).toBe(true);
      expect(isHpaEquipment({ name: "WOLVERINE AIRSOFT REGULATOR WITH REMOTE STORM-5 ONTANK" })).toBe(true);
      expect(isHpaEquipment({ name: "ARMADILLO HPA TANK 48CL/4500 (749CC) CARBON M18X1.5" })).toBe(true);
      expect(isHpaEquipment({ name: "ARMADILLO PCP CILINDRO CARBON 2000CC 4500PSI M18X1.5" })).toBe(true);
    });

    it("deve classificar mangueiras, canos e linhas de ar HPA", () => {
      expect(isHpaEquipment({ name: "AMFED REMOTE LINE HPA FOR STORM REGULATOR" })).toBe(true);
      expect(isHpaEquipment({ name: "REDLINE AIR LINE QD CONNECTOR FOR HPA" })).toBe(true);
    });

    it("deve classificar engines, kits de conversão e adaptadores HPA", () => {
      expect(isHpaEquipment({ name: "REDLINE N7 GEN.2 FCU HPA ELECTRO PNEUMATIC CONVERSION KIT FOR AK V3 AEG" })).toBe(true);
      expect(isHpaEquipment({ name: "WOLVERINE AIRSOFT BOLT M HPA ENGINE CONVERSION KIT FOR TM VSR-10" })).toBe(true);
      expect(isHpaEquipment({ name: "ACTION ARMY HPA ADAPTER FOR MARUI" })).toBe(true);
    });

    it("não deve classificar latas comuns de Green Gas nem baterias como HPA", () => {
      expect(isHpaEquipment({ name: "PUFF DINO GREEN GAS 12KG 600ML" })).toBe(false);
      expect(isHpaEquipment({ name: "TITAN LIPO BATTERY 11.1V 3000MAH DEANS" })).toBe(false);
    });
  });

  describe("Coldres e Porta-Coldres (#coldres)", () => {
    it("deve identificar coldres legítimos", () => {
      expect(isHolster({ name: "AMOMAX COLDRE BERETTA 92 BLACK", category: "vestuario" })).toBe(true);
      expect(isHolster({ name: "CYTAC COLDRE I-MINI PARA GLOCK 17, 22, 31 IWB", category: "vestuario" })).toBe(true);
      expect(isHolster({ name: "AMOMAX FABRIC HOLSTER UNIVERSAL LIGHT BEARING BLACK", category: "vestuario" })).toBe(true);
      expect(isHolster({ name: "TACBULL NYLON UNIVERSAL HOLSTER ( COLDRE ) WITH SINGLE MAG POUCH", category: "vestuario" })).toBe(true);
    });

    it("não deve considerar lanternas com coldre como categoria coldre", () => {
      expect(isHolster({ name: "VOYAGER FLASHLIGHT OUTDOOR ZOOM 200W WITH HOLSTER", category: "miras" })).toBe(false);
    });
  });

  describe("Handguards Avulsos (#pecas-externas) vs Réplicas Completas", () => {
    it("deve classificar handguards avulsos deslocados em réplicas, snipers e pistolas", () => {
      const aresHg = {
        name: "ARES HANDGUARD 7 OCTAGONAL METAL FOR M4 / M16 AEG BLACK",
        category: "replicas",
      };
      const silverbackHg = {
        name: "SILVERBACK M-LOK COVERT HANDGUARD FOR SRS A2 BLACK",
        category: "sniper",
      };
      const aap01Hg = {
        name: "ACTION ARMY HANDGUARD ALUMINIUM M-LOK SET FOR AAP01 BLACK",
        category: "pistolas",
      };
      const deltaRing = {
        name: "CYMA DELTA RING FOR HANDGUARD M4 / M16 AEG BLACK",
        category: "replicas",
      };

      expect(isHandguard(aresHg)).toBe(true);
      expect(isAegReplica(aresHg)).toBe(false); // Não deve aparecer como rifle AEG!

      expect(isHandguard(silverbackHg)).toBe(true);
      expect(isTrueSpringSniper(silverbackHg)).toBe(false); // Não deve aparecer como rifle sniper!

      expect(isHandguard(aap01Hg)).toBe(true);
      expect(isHandguard(deltaRing)).toBe(true);
    });

    it("não deve classificar rifles completos que possuem handguards nas especificações como handguard avulso", () => {
      const apsRifle = {
        name: "APS AEG ASR 2E112R2 2.0 HANDGUARD 10 SILVER EDGE BLOWBACK AIRSOFT RIFLE BLACK",
        category: "replicas",
      };
      const cymaRifle = {
        name: "CYMA AEG M4 M-LOK SPORT SERIES HANDGUARD 13 AIRSOFT RIFLE BLACK",
        category: "replicas",
      };

      expect(isHandguard(apsRifle)).toBe(false);
      expect(isAegReplica(apsRifle)).toBe(true); // Permanece como rifle AEG legítimo!

      expect(isHandguard(cymaRifle)).toBe(false);
      expect(isAegReplica(cymaRifle)).toBe(true);
    });

    it("não deve classificar interruptores ou fiações de gearbox que passam pelo handguard como handguards externos", () => {
      const switchAssembly = {
        name: "LCT HANDGUARD SWITCH ASSEMBLY FOR GEARBOX VER. 3",
        category: "pecas-internas",
      };
      const mosfetWired = {
        name: "LCT MOSFET WIRE SWITCH FOR GEARBOX VER. 2 - WIRED TO HANDGUARD",
        category: "pecas-internas",
      };

      expect(isHandguard(switchAssembly)).toBe(false);
      expect(isHandguard(mosfetWired)).toBe(false);
    });
  });

  describe("Magazines & Carregadores (#magazines)", () => {
    it("deve identificar magazines avulsos de diversas plataformas e speed loaders", () => {
      expect(isMagazine({ name: "CYMA MAGAZINE 130R FOR M4 / M16 AEG BLACK", category: "magazines" })).toBe(true);
      expect(isMagazine({ name: "G&G MAGAZINE 105R SSG-1 COUNTING MARKS BLACK TANSLUCID", category: "speedsoft" })).toBe(true);
      expect(isMagazine({ name: "PTS EPM1 MAGAZINE 250R FOR M4 AEG BLACK", category: "magazines" })).toBe(true);
      expect(isMagazine({ name: "TOKYO MARUI MAGAZINE 50R EXTENDED FOR G SERIES GBB", category: "magazines" })).toBe(true);
      expect(isMagazine({ name: "CYMA SPEED LOADER 100R BLACK" })).toBe(true);
      expect(isMagazine({ name: "PTS ODIN INNOVATIONS SPEED LOADER 1600R M12 BLACK" })).toBe(true);
    });

    it("não deve considerar porta-carregadores, cases ou sensores como magazines", () => {
      expect(isMagazine({ name: "WOSPORT MAGAZINE CASE IPSC MULTI-ANGLE ROTATING BLACK", category: "vestuario" })).toBe(false);
      expect(isMagazine({ name: "GATE MAGAZINE SENSOR WITH CABLE FOR TITAN II BLUETOOTH", category: "pecas-internas" })).toBe(false);
      expect(isMagazine({ name: "CYMA MAGAZINE RELEASE CATCH FOR M4 AEG", category: "pecas-externas" })).toBe(false);
    });

    it("não deve considerar armas completas vendidas com drum mag como magazines", () => {
      const aa12 = {
        name: "TOKYO MARUI AEG AA-12 SHOTGUN FULL-AUTO WITH DRUM MAG AIRSOFT RIFLE BLACK",
        category: "replicas",
      };
      expect(isMagazine(aa12)).toBe(false);
    });
  });

  describe("Snipers a mola verdadeiras (Spring / Bolt Action)", () => {
    it("deve classificar VSR-10 e L96 como Snipers legítimas", () => {
      const vsr10 = {
        name: "TOKYO MARUI SPRING SNIPER VSR-10 PRO AIRSOFT RIFLE BLACK",
        category: "pecas-internas",
      };
      const l96 = {
        name: "CYMA SPRING SNIPER L96 STANDARD BOLT ACTION HIGH POWER AIRSOFT RIFLE BLACK",
        category: "pecas-internas",
      };

      expect(isTrueSpringSniper(vsr10)).toBe(true);
      expect(isTrueSpringSniper(l96)).toBe(true);
      expect(isShotgun(vsr10)).toBe(false);
    });
  });
});
