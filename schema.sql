-- 매물 유형 enum
CREATE TYPE property_type AS ENUM ('APARTMENT', 'OFFICETEL', 'VILLA', 'HOUSE', 'STUDIO');

-- 거래 유형 enum
CREATE TYPE transaction_type AS ENUM ('SALE', 'JEONSE', 'MONTHLY_RENT');

-- 방향 enum
CREATE TYPE direction AS ENUM ('SOUTH', 'NORTH', 'EAST', 'WEST', 'SOUTHEAST', 'SOUTHWEST', 'NORTHEAST', 'NORTHWEST');

-- 미디어 타입 enum
CREATE TYPE media_type AS ENUM ('IMAGE', 'VIDEO');

-- 문서 타입 enum
CREATE TYPE document_type AS ENUM ('PROPERTY_OWNERSHIP', 'BUSINESS_LICENSE', 'ID_CARD', 'CONTRACT', 'OTHER');

-- 인증 상태 enum
CREATE TYPE verification_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- 매물 테이블
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES auth.users(id),
    title TEXT NOT NULL,
    address TEXT NOT NULL,
    price TEXT NOT NULL,
    size_info TEXT NOT NULL,
    property_type property_type NOT NULL,
    transaction_type transaction_type NOT NULL,
    total_floors INTEGER,
    room_count INTEGER,
    bathroom_count INTEGER,
    parking_spaces TEXT,
    management_fee TEXT,
    direction direction,
    move_in_date TEXT,
    approval_date TEXT,
    description TEXT,
    features TEXT,
    contact_info TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 매물 미디어 테이블
CREATE TABLE property_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    media_url TEXT NOT NULL,
    media_type media_type NOT NULL,
    file_name TEXT,
    file_size BIGINT,
    display_order INTEGER DEFAULT 0,
    is_main_image BOOLEAN DEFAULT false,
    alt_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 매물 문서 테이블
CREATE TABLE property_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    document_url TEXT NOT NULL,
    document_type document_type NOT NULL,
    document_name TEXT,
    file_size BIGINT,
    verification_status verification_status DEFAULT 'PENDING',
    verified_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 사용자 인증 문서 테이블
CREATE TABLE user_verification_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    document_url TEXT NOT NULL,
    document_type document_type NOT NULL,
    document_name TEXT,
    file_size BIGINT,
    verification_status verification_status DEFAULT 'PENDING',
    verified_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 관심 매물 테이블
CREATE TABLE user_favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, property_id)
);

-- 인덱스 생성
CREATE INDEX idx_properties_owner_id ON properties(owner_id);
CREATE INDEX idx_properties_property_type ON properties(property_type);
CREATE INDEX idx_properties_transaction_type ON properties(transaction_type);
CREATE INDEX idx_properties_is_active ON properties(is_active);
CREATE INDEX idx_property_media_property_id ON property_media(property_id);
CREATE INDEX idx_property_documents_property_id ON property_documents(property_id);
CREATE INDEX idx_user_verification_documents_user_id ON user_verification_documents(user_id);
CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX idx_user_favorites_property_id ON user_favorites(property_id);

-- RLS 정책 설정
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_verification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- properties 테이블 정책
CREATE POLICY "모든 사용자가 매물을 조회할 수 있음" ON properties
    FOR SELECT USING (true);

CREATE POLICY "소유자만 매물을 생성할 수 있음" ON properties
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "소유자만 매물을 수정할 수 있음" ON properties
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "소유자만 매물을 삭제할 수 있음" ON properties
    FOR DELETE USING (auth.uid() = owner_id);

-- property_media 테이블 정책
CREATE POLICY "모든 사용자가 매물 미디어를 조회할 수 있음" ON property_media
    FOR SELECT USING (true);

CREATE POLICY "소유자만 매물 미디어를 생성할 수 있음" ON property_media
    FOR INSERT WITH CHECK (EXISTS (
        SELECT 1 FROM properties WHERE id = property_id AND owner_id = auth.uid()
    ));

CREATE POLICY "소유자만 매물 미디어를 수정할 수 있음" ON property_media
    FOR UPDATE USING (EXISTS (
        SELECT 1 FROM properties WHERE id = property_id AND owner_id = auth.uid()
    ));

CREATE POLICY "소유자만 매물 미디어를 삭제할 수 있음" ON property_media
    FOR DELETE USING (EXISTS (
        SELECT 1 FROM properties WHERE id = property_id AND owner_id = auth.uid()
    ));

-- property_documents 테이블 정책
CREATE POLICY "소유자만 매물 문서를 조회할 수 있음" ON property_documents
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM properties WHERE id = property_id AND owner_id = auth.uid()
    ));

CREATE POLICY "소유자만 매물 문서를 생성할 수 있음" ON property_documents
    FOR INSERT WITH CHECK (EXISTS (
        SELECT 1 FROM properties WHERE id = property_id AND owner_id = auth.uid()
    ));

CREATE POLICY "소유자만 매물 문서를 수정할 수 있음" ON property_documents
    FOR UPDATE USING (EXISTS (
        SELECT 1 FROM properties WHERE id = property_id AND owner_id = auth.uid()
    ));

CREATE POLICY "소유자만 매물 문서를 삭제할 수 있음" ON property_documents
    FOR DELETE USING (EXISTS (
        SELECT 1 FROM properties WHERE id = property_id AND owner_id = auth.uid()
    ));

-- user_verification_documents 테이블 정책
CREATE POLICY "사용자는 자신의 인증 문서만 조회할 수 있음" ON user_verification_documents
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "사용자는 자신의 인증 문서만 생성할 수 있음" ON user_verification_documents
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "사용자는 자신의 인증 문서만 수정할 수 있음" ON user_verification_documents
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "사용자는 자신의 인증 문서만 삭제할 수 있음" ON user_verification_documents
    FOR DELETE USING (auth.uid() = user_id);

-- user_favorites 테이블 정책
CREATE POLICY "사용자는 자신의 관심 매물만 조회할 수 있음" ON user_favorites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "사용자는 자신의 관심 매물만 생성할 수 있음" ON user_favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "사용자는 자신의 관심 매물만 삭제할 수 있음" ON user_favorites
    FOR DELETE USING (auth.uid() = user_id); 