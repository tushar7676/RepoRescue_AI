from fastapi import APIRouter, HTTPException, status
from app.schemas import AnalyzeRequest, AnalyzeResponse, ImpactRequest, ImpactResponse
from app.services.git_service import GitServiceError
from app.services.repository_analyzer import RepositoryAnalyzer
from app.services.impact_service import ImpactService

router = APIRouter()

@router.get("/health")
def health_check():
    return {"status": "ok"}

@router.post("/api/analyze", response_model=AnalyzeResponse)
def analyze_repository(payload: AnalyzeRequest):
    try:
        return RepositoryAnalyzer.analyze_repository(payload.repo_url)
    except GitServiceError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred during analysis: {str(e)}"
        )

@router.post("/api/impact", response_model=ImpactResponse)
def analyze_impact(payload: ImpactRequest):
    try:
        if not payload.change_request.strip():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Change request description cannot be empty.")
        return ImpactService.analyze_change_impact(payload.repo_url, payload.change_request)
    except GitServiceError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred during change impact analysis: {str(e)}"
        )
