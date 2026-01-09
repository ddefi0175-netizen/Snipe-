#!/bin/bash
# ============================================
# Master Test Runner - Run All Tests
# ============================================
# Executes all verification tests in sequence
# Comprehensive validation for public release

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Test results tracking
declare -a TEST_RESULTS
declare -a TEST_NAMES

echo -e "${BOLD}${CYAN}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║     🚀  SNIPE COMPREHENSIVE TEST SUITE  🚀                   ║
║                                                               ║
║     Testing all functionality for public release             ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"
echo ""

START_TIME=$(date +%s)

# Function to run a test and track results
run_test() {
    local test_script="$1"
    local test_name="$2"
    
    echo -e "${BOLD}${BLUE}═══════════════════════════════════════════════════════${NC}"
    echo -e "${BOLD}${BLUE}Running: $test_name${NC}"
    echo -e "${BOLD}${BLUE}═══════════════════════════════════════════════════════${NC}"
    echo ""
    
    if [ -x "$test_script" ]; then
        if "$test_script"; then
            TEST_RESULTS+=("PASS")
            echo -e "${GREEN}✅ $test_name - PASSED${NC}"
        else
            TEST_RESULTS+=("FAIL")
            echo -e "${RED}❌ $test_name - FAILED${NC}"
        fi
    else
        TEST_RESULTS+=("SKIP")
        echo -e "${YELLOW}⚠️  $test_name - SKIPPED (script not found or not executable)${NC}"
    fi
    
    TEST_NAMES+=("$test_name")
    echo ""
    echo ""
}

# Run all tests
echo -e "${CYAN}Starting comprehensive test suite...${NC}"
echo ""
sleep 2

# Test 1: Firebase Real-Time Data Integration
run_test "./test-firebase-realtime.sh" "Firebase Real-Time Data Integration"

# Test 2: Admin and Master Access Control
run_test "./test-admin-access-control.sh" "Admin and Master Access Control"

# Test 3: Login Functionality
run_test "./test-login-functionality.sh" "Login Functionality"

# Test 4: Production Readiness
run_test "./test-production-readiness.sh" "Production Readiness"

# Calculate duration
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
MINUTES=$((DURATION / 60))
SECONDS=$((DURATION % 60))

# Generate Final Report
echo -e "${BOLD}${CYAN}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║                    📊 FINAL TEST REPORT 📊                   ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"
echo ""

# Count results
TOTAL_TESTS=${#TEST_RESULTS[@]}
PASSED_TESTS=0
FAILED_TESTS=0
SKIPPED_TESTS=0

for result in "${TEST_RESULTS[@]}"; do
    case $result in
        PASS) PASSED_TESTS=$((PASSED_TESTS + 1)) ;;
        FAIL) FAILED_TESTS=$((FAILED_TESTS + 1)) ;;
        SKIP) SKIPPED_TESTS=$((SKIPPED_TESTS + 1)) ;;
    esac
done

# Display individual test results
echo -e "${BOLD}Individual Test Results:${NC}"
echo ""
for i in "${!TEST_NAMES[@]}"; do
    test_name="${TEST_NAMES[$i]}"
    result="${TEST_RESULTS[$i]}"
    
    case $result in
        PASS) 
            echo -e "  ${GREEN}✅ PASS${NC} - $test_name"
            ;;
        FAIL) 
            echo -e "  ${RED}❌ FAIL${NC} - $test_name"
            ;;
        SKIP) 
            echo -e "  ${YELLOW}⚠️  SKIP${NC} - $test_name"
            ;;
    esac
done
echo ""

# Display summary
echo -e "${BOLD}Summary:${NC}"
echo -e "  Total Tests:   ${BOLD}$TOTAL_TESTS${NC}"
echo -e "  ${GREEN}Passed:        $PASSED_TESTS${NC}"
echo -e "  ${RED}Failed:        $FAILED_TESTS${NC}"
echo -e "  ${YELLOW}Skipped:       $SKIPPED_TESTS${NC}"
echo ""
echo -e "  Duration:      ${MINUTES}m ${SECONDS}s"
echo ""

# Final verdict
if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${BOLD}${GREEN}"
    cat << "EOF"
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║           ✅  ALL TESTS PASSED SUCCESSFULLY! ✅             ║
║                                                               ║
║           The application is ready for:                       ║
║           • Public release                                    ║
║           • Production deployment                             ║
║           • Real-time data operations                         ║
║           • Admin and master account control                  ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
    
    echo ""
    echo -e "${CYAN}Next Steps:${NC}"
    echo -e "  1. Review the test results above"
    echo -e "  2. Verify Firebase configuration is complete"
    echo -e "  3. Deploy to production (see DEPLOYMENT.md)"
    echo -e "  4. Make repository public (see RELEASE_CHECKLIST.md)"
    echo ""
    
    exit 0
else
    echo -e "${BOLD}${RED}"
    cat << "EOF"
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║              ❌  SOME TESTS FAILED  ❌                       ║
║                                                               ║
║           Please review and fix the issues above              ║
║           before proceeding with public release               ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
    
    echo ""
    echo -e "${YELLOW}Action Required:${NC}"
    echo -e "  1. Review the failed tests above"
    echo -e "  2. Fix the identified issues"
    echo -e "  3. Re-run this test suite"
    echo ""
    
    exit 1
fi
