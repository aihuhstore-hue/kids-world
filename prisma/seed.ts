import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const products = [
  {
    slug: "educational-blocks-18-months",
    name: "مكعبات تعليمية ملونة للرضع",
    description:
      "مجموعة مكعبات ناعمة وآمنة للرضع، مصنوعة من مواد طبيعية آمنة تماماً، تساعد على تطوير الإدراك الحسي والمهارات الحركية.",
    longDescription:
      "مكعباتنا التعليمية مصممة خصيصاً لمرحلة الطفولة الأولى. تحتوي المجموعة على 12 مكعباً بألوان زاهية تجذب انتباه طفلك وتنمي حواسه البصرية. مادة السيليكون الغذائي المستخدمة آمنة 100% ومعتمدة دولياً.",
    hookTitle:
      "هل تبحث عن لعبة آمنة تنمي حواس طفلك الصغير؟ اكتشف مكعباتنا التعليمية الرائعة! 🌈",
    features: JSON.stringify([
      "✅ مواد سيليكون غذائي آمنة 100%",
      "✅ تنمي الإدراك الحسي والبصري",
      "✅ تطور المهارات الحركية الدقيقة",
      "✅ 12 مكعباً بألوان مختلفة",
      "✅ سهلة التنظيف والتعقيم",
      "✅ مناسبة من عمر 3 أشهر",
    ]),
    price: 1800,
    oldPrice: 2500,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1566454419290-57a64afe34a0?w=600&h=600&fit=crop",
    ]),
    ageGroup: "MONTHS_0_18",
    type: "TOY",
    stock: 45,
    isActive: true,
  },
  {
    slug: "baby-soft-book-arabic",
    name: "كتاب القماش العربي للرضع",
    description:
      "كتاب قماشي ناعم مليء بالألوان والأشكال والكلمات العربية الأولى، مثالي لتعريف طفلك باللغة العربية منذ الصغر.",
    longDescription:
      "كتاب القماش العربي مصمم خصيصاً للأطفال الجزائريين. يحتوي على 10 صفحات ملونة بكلمات عربية أساسية مع صور جذابة. الأقمشة المستخدمة ناعمة ومعتمدة للأطفال.",
    hookTitle:
      "علّم طفلك العربية من أول شهور حياته! كتاب قماشي ممتع يحبه كل الأطفال 📖",
    features: JSON.stringify([
      "✅ قماش ناعم آمن للرضع",
      "✅ كلمات عربية أساسية مع صور",
      "✅ ألوان زاهية تجذب الانتباه",
      "✅ يمكن غسله في الغسالة",
      "✅ 10 صفحات تعليمية",
      "✅ يحفز الفضول والتعلم المبكر",
    ]),
    price: 1200,
    oldPrice: null,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1481349518771-20055b2a7b24?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&h=600&fit=crop",
    ]),
    ageGroup: "MONTHS_0_18",
    type: "BOOK",
    stock: 30,
    isActive: true,
  },
  {
    slug: "shape-sorter-toy-18-36",
    name: "لعبة فرز الأشكال الهندسية",
    description:
      "لعبة خشبية تفاعلية تساعد الطفل على التعرف على الأشكال والألوان وتطوير التفكير المنطقي.",
    longDescription:
      "لعبة فرز الأشكال الكلاسيكية بلمسة عصرية. مصنوعة من خشب طبيعي مطلي بألوان غير سامة. تأتي مع 8 أشكال هندسية مختلفة وصندوق تفاعلي ممتع.",
    hookTitle:
      "لعبة واحدة تعلم طفلك الأشكال والألوان والصبر في نفس الوقت! 🧩",
    features: JSON.stringify([
      "✅ خشب طبيعي معتمد وآمن",
      "✅ 8 أشكال هندسية ملونة",
      "✅ تطور التفكير المنطقي",
      "✅ تحسن التنسيق بين اليد والعين",
      "✅ ألوان غير سامة",
      "✅ متينة وتدوم طويلاً",
    ]),
    price: 2200,
    oldPrice: 3000,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&h=600&fit=crop",
    ]),
    ageGroup: "MONTHS_18_36",
    type: "TOY",
    stock: 25,
    isActive: true,
  },
  {
    slug: "arabic-alphabet-puzzle",
    name: "بازل الحروف العربية الخشبي",
    description:
      "بازل خشبي تعليمي يحتوي على جميع حروف الأبجدية العربية بألوان جذابة، يساعد الطفل على تعلم الحروف بطريقة ممتعة.",
    hookTitle:
      "تعلم الأبجدية العربية بطريقة ممتعة! بازل خشبي يعشقه كل طفل 🔤",
    features: JSON.stringify([
      "✅ 28 قطعة بازل للحروف العربية",
      "✅ خشب طبيعي ومتين",
      "✅ ألوان زاهية وجذابة",
      "✅ يطور مهارة التعرف على الحروف",
      "✅ حجم مناسب لأيدي الأطفال",
      "✅ مع لوحة تصنيف ملونة",
    ]),
    price: 1900,
    oldPrice: null,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=600&fit=crop",
    ]),
    ageGroup: "MONTHS_18_36",
    type: "TOY",
    stock: 40,
    isActive: true,
  },
  {
    slug: "coloring-book-animals-3-5",
    name: "كتاب التلوين الكبير — عالم الحيوانات",
    description:
      "كتاب تلوين ضخم يحتوي على 60 صفحة من رسومات الحيوانات الجميلة لتنمية إبداع وخيال طفلك.",
    hookTitle:
      "أبعد طفلك عن الشاشات بكتاب تلوين يُشعله بالإبداع! 🎨",
    features: JSON.stringify([
      "✅ 60 صفحة رسومات حيوانات",
      "✅ ورق سميك مناسب للألوان",
      "✅ رسومات واضحة وكبيرة",
      "✅ يطور الإبداع والتركيز",
      "✅ مناسب للتلوين بالأقلام والألوان المائية",
      "✅ مع تعليمات باللغة العربية",
    ]),
    price: 800,
    oldPrice: 1200,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&h=600&fit=crop",
    ]),
    ageGroup: "YEARS_3_5",
    type: "BOOK",
    stock: 60,
    isActive: true,
  },
  {
    slug: "magnetic-building-blocks",
    name: "مكعبات المغناطيس البنائية",
    description:
      "مجموعة مكعبات مغناطيسية ملونة تسمح للأطفال ببناء أشكال ثلاثية الأبعاد رائعة وتنمية التفكير الإبداعي.",
    hookTitle:
      "اللعبة التي تحول طفلك إلى مهندس صغير في دقائق! 🏗️",
    features: JSON.stringify([
      "✅ 32 قطعة مغناطيسية ملونة",
      "✅ بناء أشكال ثلاثية الأبعاد",
      "✅ تطور التفكير المكاني",
      "✅ مواد ABS آمنة ومتينة",
      "✅ مغناطيسات قوية ومثبتة بأمان",
      "✅ يمكن ربطها بأشكال لانهائية",
    ]),
    price: 3500,
    oldPrice: 4500,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop",
    ]),
    ageGroup: "YEARS_3_5",
    type: "TOY",
    stock: 20,
    isActive: true,
  },
  {
    slug: "arabic-science-book-kids",
    name: "موسوعة العلوم للأطفال بالعربية",
    description:
      "موسوعة علمية شاملة للأطفال باللغة العربية تشرح مفاهيم العلوم والطبيعة بأسلوب ممتع وبسيط مع رسوم توضيحية رائعة.",
    hookTitle:
      "اجعل طفلك يحب العلوم والاكتشاف منذ الصغر! موسوعة علمية رائعة بالعربية 🔬",
    features: JSON.stringify([
      "✅ 200 صفحة بمحتوى علمي ثري",
      "✅ باللغة العربية الفصحى البسيطة",
      "✅ رسوم توضيحية ملونة وجذابة",
      "✅ تجارب علمية بسيطة في المنزل",
      "✅ يغطي الفيزياء والكيمياء والأحياء",
      "✅ موصى به من المعلمين",
    ]),
    price: 2800,
    oldPrice: null,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&h=600&fit=crop",
    ]),
    ageGroup: "YEARS_6_PLUS",
    type: "BOOK",
    stock: 35,
    isActive: true,
  },
  {
    slug: "chess-kids-educational",
    name: "لعبة الشطرنج التعليمية للأطفال",
    description:
      "لعبة شطرنج مبسطة للأطفال مع تعليمات باللغة العربية وقطع كبيرة ملونة لتعليم الأطفال قواعد هذه اللعبة الذهنية الرائعة.",
    hookTitle:
      "علّم طفلك التفكير الاستراتيجي والتركيز بلعبة الشطرنج! 🧠♟️",
    features: JSON.stringify([
      "✅ قطع كبيرة وآمنة للأطفال",
      "✅ رقعة شطرنج ملونة جذابة",
      "✅ كتيب تعليمي بالعربية مع الطلب",
      "✅ يطور التفكير الاستراتيجي",
      "✅ يحسن مهارات التركيز والصبر",
      "✅ مناسبة من عمر 6 سنوات",
    ]),
    price: 2100,
    oldPrice: 2800,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1528819622765-d6bcf132f793?w=600&h=600&fit=crop",
    ]),
    ageGroup: "YEARS_6_PLUS",
    type: "TOY",
    stock: 18,
    isActive: true,
  },
  {
    slug: "arabic-stories-collection",
    name: "مجموعة قصص عربية للأطفال (10 كتب)",
    description:
      "مجموعة من 10 قصص عربية مشوقة للأطفال تحمل قيماً تربوية جميلة، مع رسومات ملونة تجذب الأطفال.",
    hookTitle:
      "هدية لا تُنسى لطفلك! 10 قصص عربية تُعلّم القيم وتُشعل حب القراءة 📚",
    features: JSON.stringify([
      "✅ 10 قصص أخلاقية قيّمة",
      "✅ لغة عربية سهلة وجذابة",
      "✅ رسومات ملونة احترافية",
      "✅ قيم تربوية إيجابية",
      "✅ تحفز حب القراءة",
      "✅ مناسبة من 5 إلى 10 سنوات",
    ]),
    price: 3200,
    oldPrice: 4000,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&h=600&fit=crop",
    ]),
    ageGroup: "YEARS_6_PLUS",
    type: "BOOK",
    stock: 50,
    isActive: true,
  },
  {
    slug: "wooden-kitchen-play-set",
    name: "مطبخ الأطفال الخشبي التفاعلي",
    description:
      "مطبخ خشبي صغير للأطفال مع أدوات وملحقات تعليمية رائعة تساعد على تطوير المهارات الحياتية واللعب الإبداعي.",
    hookTitle:
      "هل تريد لعبة تشغل طفلك لساعات وتعلمه في نفس الوقت؟ المطبخ الخشبي الخيار المثالي! 🍳",
    features: JSON.stringify([
      "✅ خشب طبيعي عالي الجودة",
      "✅ 20 قطعة إكسسوار مطبخية",
      "✅ يطور التخيل ولعب الأدوار",
      "✅ ألوان جذابة وزاهية",
      "✅ سهل التركيب والتنظيف",
      "✅ يعلم المهارات الحياتية",
    ]),
    price: 4500,
    oldPrice: 6000,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1555985960-01ba7b5c27e2?w=600&h=600&fit=crop",
    ]),
    ageGroup: "YEARS_3_5",
    type: "TOY",
    stock: 12,
    isActive: true,
  },
];

async function main() {
  console.log("🌱 بدء إضافة البيانات التجريبية...");

  for (const product of products) {
    const existing = await prisma.product.findUnique({
      where: { slug: product.slug },
    });

    if (!existing) {
      await prisma.product.create({ data: product });
      console.log(`✅ تمت إضافة: ${product.name}`);
    } else {
      console.log(`⏩ موجود مسبقاً: ${product.name}`);
    }
  }

  console.log("✅ اكتملت إضافة البيانات التجريبية!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
